---
title: "Terminal: Previous Shortcut"
TILIndex: 29
date: 2024-04-19
source: https://www.joshwcomeau.com/javascript/terminal-for-js-devs/
tldr: "You can add multiple items in an aria-labelledby and it will concatenate them... Pretty rad."
---

It's not often that I feel like I need to write up an `aria-label` for something because the using `aria-labelledby` won't cut it, but it has happened a few times. Well, today I learned that you can concatenate values in `aria-labelledby`. It's simple just add multiple IDs in the order you want them to be concatenated. Like this:

```html
<article aria-labelledby="read-more title">
	<h2><a href="#" id="title">Sup Dude</a></h2>
	<p>Short description here...</p>
	<a href="#" id="read-more">Read More</a>
</article>
```

> Note: this works for `aria-describedby` as well.
