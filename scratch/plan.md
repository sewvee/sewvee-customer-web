# Plan: Left Alignment & Featured Cards Fix

## 1. Left Alignment Fix
The goal is to ensure every section perfectly aligns on the left edge (`x = 20px`).
- **Header**: Already at `20px` (`px-5`).
- **Inline Banners**: Currently centered (`snap-center w-[90%]`). I will change this to align left by changing the wrapper to use `snap-start`, dropping the `px-5` on the wrapper, adding a `w-5` spacer, and ensuring the banners start exactly at `20px`.
- **Featured in Shop**: I will revert the `-mx-5 px-5` hack and use a physical `<div className="shrink-0 w-5" />` spacer so the first card is exactly at `20px`, perfectly matching the Quick Actions grid.

## 2. Featured Cards "Little Bit Different" Fix
- I previously added a `p-1.5` inner padding to the images because I misunderstood "radius with respect to the outer box". The user actually just wants the image corners to round along with the outer card.
- I will remove `p-1.5` so the image sits flush against the card edges again.
- I will apply `rounded-t-[16px]` to the image container so the top corners are perfectly rounded, matching the card's outer radius.
