import { ArrowDownward, ArrowUpward } from '@material-ui/icons'
import {
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  OutlinedInput,
} from '@mui/material'
import { ChangeEvent, useState } from 'react'
import Item from './components/Item'
import InfiniteScroll from 'react-infinite-scroll-component'
import axios from 'axios'

export interface IItemsProps {
  data: {
    id: string,
    url_overridden_by_dest: string,
    url: string,
    title: string,
    permalink: string,
    selftext: string,
    secure_media_embed: {
      media_domain_url: string,
    }
  }
}

function App() {
  const [items, setItems] = useState<IItemsProps[]>([])
  const [subreddit, setSubreddit] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [limit, setLimit] = useState<number>(25)
  // const [after, setAfter] = useState(""); -- Use after to get multiple pages.

  const loadSub = () => {
    setLoading(true)
    if (subreddit === '') {
      setLoading(false)
      setError('Subreddit cannot be empty')
    }
    axios.get(`https://www.reddit.com/r/` + subreddit + `/new.json?limit=${limit}`).then((res) => {
      if (res.status === 404) {
        setLoading(false)
        setError('Subreddit does not exist or is banned.')
      }
      if (res.status === 200) {
        // setAfter(body.data.after);
        setLimit(limit + 25)
        setLoading(false)
        setError('')
        console.log(res.data.data.children)
        setItems(res.data.data.children)
      }
    }).catch((err) => {
      console.error(err)
    })
  }

  const fetchMoreData = () => {
    // INFINITE SCROLL:
    setLoading(true)
    axios.get(`https://www.reddit.com/r/` + subreddit + `/new.json?limit=${limit}`).then((res) => {
      if (res.status === 404) {
        setLoading(false)
        setError('Subreddit does not exist or is banned.')
      }
      if (res.status === 200) {
        // setAfter(body.data.after);
        setLimit(limit + 25)
        setLoading(false)
        setItems(res.data.data.children)
      }
    }).catch((err) => {
      console.error(err)
    })
  }

  let scrollElement = document.scrollingElement || document.body

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    loadSub()
  }

  const scrollToTop = () => {
    scrollElement.scrollTop = 0
  }

  const scrollToBottom = () => {
    scrollElement.scrollTop = scrollElement.scrollHeight
  }

  return (
    <div className='App'>
      <form onSubmit={handleSubmit}>
        <div className='input-container'>
          <OutlinedInput
            id='input'
            type='text'
            value={subreddit}
            onChange={(e) => {
              setSubreddit(e.target.value)
            }}
            placeholder='Search Reddit'
          />
        </div>
      </form>
      <p className='error'>{error}</p>
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={true}
        loader={
          loading && (
            <div className='progress'>
              <CircularProgress />
              <h1 className='load-text'>Loading...</h1>
            </div>
          )
        }
      >
        {items !== null
          ? items.map((item: IItemsProps) => <Item key={item.data.id} data={item.data} />)
          : ''}
      </InfiniteScroll>

      <SpeedDial
        ariaLabel='SpeedDial'
        sx={{
          position: 'fixed',
          bottom: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
        }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<ArrowUpward></ArrowUpward>}
          tooltipTitle='Go up'
          onClick={scrollToTop}
        />
        <SpeedDialAction
          icon={<ArrowDownward></ArrowDownward>}
          tooltipTitle='Go down'
          onClick={scrollToBottom}
        />
      </SpeedDial>
    </div>
  )
}
export default App
