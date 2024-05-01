---
title: "Concatenating items in aria-labelledby"
TILIndex: 29
date: 2024-04-19
source: https://www.htmhell.dev/adventcalendar/2022/7/
tldr: "You can add multiple items in an aria-labelledby and it will concatenate them... Pretty rad."
---

I feel like I should have known this one, but it was news to me. Today I learned that you can concatenate values in an `aria-labelledby` attribute. I can only think of a few times where I would have really wanted to use this instead of just writing out the `aria-label`, but it's nice to have it in my back pocket. It's simple just add multiple IDs in the order you want them to be concatenated. Like this:

```html
<article>
	<h2 id="wordle-heading">Wordle</h2>
	<p>Quick Description about Wordle</p>
	<p>
		<a href="https://www.nytimes.com/games/wordle/index.html" id="wordle-play" aria-labelledby="wordle-play wordle-heading">Play</a>
	</p>
</article>
```

See [example on CodePen](https://codepen.io/davidleininger/pen/rNbQBrY/1bb6cbaf7f3762e708dc95bb3d21dda1)

By doing this, screen readers will announce something like `link, Play Wordle` instead of just `link, Play` and requiring someone to remember what card or item they are on.

> Note: this works for `aria-describedby` as well.

## When should I use `aria-label` or `aria-labelledby`?
Basically it comes down to two paths. It's a little more complicated than this but in general you should use:
- `aria-labelledby` when the text is available some where else on the page
- `aria-label` when the text doesn't exist on the page and you need to write something custom
