import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { IItemsProps } from '../App'

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
    margin: "0 auto",
    marginTop: 20,
    marginBottom: 20,
  },
  media: {
    border: "none",
    outline: "none",
    background: "none",
    width: "100%",
  },
});


export default function Item(props: IItemsProps) {
  const classes = useStyles();

  const videoLink = props.data.secure_media_embed.media_domain_url;
  let image_src = props.data.url_overridden_by_dest;
  let fallback_url = props.data.url;

  return (
    <Card className={classes.root}>
      <CardActionArea
        href={"https://reddit.com" + props.data.permalink}
        target="_blank"
        rel="noreferrer"
      >
        <CardContent>
          <Typography gutterBottom component="h1">
            {props.data.title}
          </Typography>
          <Typography gutterBottom component="p">
            {props.data.selftext}
          </Typography>
          {videoLink !== undefined ? (
            <CardMedia
              scrolling="no"
              frameBorder="0"
              className={classes.media}
              src={videoLink}
              title="Video/Gif"
              component="iframe"
              allowFullScreen
            />
          ) : (
            <CardMedia
              className={classes.media}
              component="img"
              src={image_src === undefined ? fallback_url : image_src}
              alt=''
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
