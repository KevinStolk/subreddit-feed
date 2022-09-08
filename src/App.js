import { ArrowDownward, ArrowUpward, Search } from "@material-ui/icons";
import {
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  OutlinedInput,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import React, { useEffect, useState } from "react";
import Item from "./components/Item";
import InfiniteScroll from "react-infinite-scroll-component";

function App() {
  const [items, setItems] = useState([]);
  const [subreddit, setSubreddit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(25);
  // const [after, setAfter] = useState(""); -- Use after to get multiple pages.

  const loadSub = () => {
    setLoading(true);
    if (subreddit == "") {
      setLoading(false);
      setError("Subreddit cannot be empty");
    }

    fetch(
      `https://www.reddit.com/r/` + subreddit + `.json?limit=${limit}`
    ).then((res) => {
      if (res.status === 200) {
        res
          .json()
          .then((body) => {
            // setAfter(body.data.after);
            setLimit(limit + 25);
            setLoading(false);
            setError("");
            setItems(body.data.children);
            // console.log(body.data.children);
          })
          .catch((err) => {
            console.error(err);
          });
      }
      if (res.status === 404) {
        setLoading(false);
        setError("Subreddit does not exist or is banned.");
      }
      return;
    });
  };

  const fetchMoreData = () => {
    // INFINITE SCROLL:
    setLoading(true);
    fetch(
      `https://www.reddit.com/r/` + subreddit + `/hot.json?limit=${limit}`
    ).then((res) => {
      if (res.status === 200) {
        res
          .json()
          .then((body) => {
            // setAfter(body.data.after);
            setLimit(limit + 25);
            setLoading(false);
            setItems(body.data.children);
            console.log(body.data.children);
          })
          .catch((err) => {
            console.error(err);
          });
      }
      return;
    });
  };

  let scrollElement = document.scrollingElement || document.body;

  const handleSubmit = (e) => {
    e.preventDefault();
    loadSub();
  };

  const scrollToTop = () => {
    scrollElement.scrollTop = 0;
  };

  const scrollToBottom = () => {
    scrollElement.scrollTop = scrollElement.scrollHeight;
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <OutlinedInput
            id="input"
            variant="outlined"
            type="text"
            value={subreddit}
            onChange={(e) => {
              setSubreddit(e.target.value);
            }}
            placeholder="Search Reddit"
            startAdornment={
              <InputAdornment>
                <Search></Search>
              </InputAdornment>
            }
          />
        </div>
      </form>
      <p className="error">{error}</p>
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={true}
        loader={
          loading && (
            <div className="progress">
              <CircularProgress />
              <h1 className="load-text">Loading...</h1>
            </div>
          )
        }
      >
        {items != null
          ? items.map((item) => <Item key={item.data.id} item={item.data} />)
          : ""}
      </InfiniteScroll>

      <SpeedDial
        ariaLabel="SpeedDial"
        sx={{
          position: "fixed",
          bottom: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
        }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<ArrowUpward></ArrowUpward>}
          tooltipTitle="Go up"
          onClick={scrollToTop}
        />
        <SpeedDialAction
          icon={<ArrowDownward></ArrowDownward>}
          tooltipTitle="Go down"
          onClick={scrollToBottom}
        />
      </SpeedDial>
    </div>
  );
}
export default App;
