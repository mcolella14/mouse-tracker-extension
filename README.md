# mouse-tracker-extension

Chrome extension that can record mouse movements/clicks on a page and export them as a JSON array. Also draws a nice little picture of the movements in the popup window.

## Known bugs/issues

- Does not work across page loads. Will stop recording after a page load is in process, but will still be able to export everyhting up until that page load.
- Is not happy if you resize the screen while moving, or if you use with a devtools window open. The image drawing does not work properly in these cases.
- Will only work on http/https sites (i.e. won't work on `about:blank` or `chrome://version/`)

## Export format
```json
{
    "mouseActions": [
        {
            "action": "move",
            "coords": {
                "x": 1764,
                "y": 114
            }
        },
        {
            "action": "move",
            "coords": {
                "x": 1762,
                "y": 116
            }
        },
        {
            "action": "click",
            "coords": {
                "x": 1762,
                "y": 116
            }
        },
        {
            "action": "move",
            "coords": {
                "x": 1762,
                "y": 115
            }
        },
        {
            "action": "move",
            "coords": {
                "x": 1766,
                "y": 99
            }
        }
    ],
    "screenDimensions": {
        "height": 920,
        "width": 1918
    }
}
```
