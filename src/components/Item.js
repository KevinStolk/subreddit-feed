import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

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

function Item(props) {
  const classes = useStyles();

  const videoLink = props.item.secure_media_embed.media_domain_url;
  let image_src = props.item.url_overridden_by_dest;
  let fallback_url = props.item.url;


  return (
    <Card className={classes.root}>
      <CardActionArea
        href={"https://reddit.com" + props.item.permalink}
        target="_blank"
        rel="noreferrer"
      >
        <CardContent>
          <Typography gutterBottom component="h1">
            {props.item.title}
          </Typography>
          {videoLink !== undefined ? (
            <CardMedia
              scrolling="no"
              frameBorder="0"
              className={classes.media}
              src={videoLink}
              title="Video/Gif"
              component="iframe"
            />
          ) : (
            <CardMedia
              className={classes.media}
              component="img"
              src={image_src === undefined ? fallback_url : image_src}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default Item;
