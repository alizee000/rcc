import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const GIFS = [
  "https://media.giphy.com/media/3o7TKrEzvLbgzGmMle/giphy.gif",
  "https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif",
  "https://media.giphy.com/media/3o6Ztg2MgUkcXyCgtG/giphy.gif",
  "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif"
];

async function updateVenues() {
  const venues = await client.query(api.venues.getVenues);
  
  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i];
    const gifUrl = GIFS[i % GIFS.length];
    
    // We don't have an updateVenue mutation, so let's check if we can add one
    // or just use internal db if we were running on server.
    // Instead of full client mutation, we'll run a Node script with a custom mutation!
  }
}
