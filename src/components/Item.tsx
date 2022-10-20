import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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


export default function Item(props: any) {
  const classes = useStyles();

  console.log(props.item)

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
          <Typography gutterBottom component="p">
            {props.item.selftext}
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
