# Embed Widget

The embed widget lets partner sites display a Soluddy campaign in an iframe. It reads campaign data from `/api/vault/[slug]` and renders a responsive call to action.

## Basic Usage

1. Confirm the campaign slug exists on the target Solana cluster.
2. Add an iframe that points to `/embed/[slug]` on your deployed domain.

```html
<iframe
  src="https://soluddy.com/embed/soluddy"
  width="100%"
  height="140"
  loading="lazy"
  title="Soluddy donation widget">
</iframe>
```

## Appearance Parameters

Pass query parameters to adjust colors and corner radius. All parameters are optional. Colors accept hex values with or without `#`.

| Parameter         | Default  | Description                                                 |
|-------------------|----------|-------------------------------------------------------------|
| `bg`              | `fffffc` | Card background color.                                      |
| `border`          | `ebe6ff` | Card border color.                                          |
| `titleColor`      | `312062` | Campaign name color.                                        |
| `textColor`       | `625599` | Campaign description color.                                 |
| `buttonColor`     | `512ea8` | Donate button background.                                   |
| `buttonTextColor` | `fffffc` | Donate button text.                                         |
| `iconBg`          | `fffffc` | Background behind the Soluddy icon.                         |
| `radius`          | `18px`   | Corner radius (accepts values like `0`, `16px`, or `1rem`). |

### Example

```html
<iframe
  src="https://soluddy.com/embed/soluddy?bg=fef7ff&border=e4d8ff&titleColor=2b184e&textColor=665892&buttonColor=ff7aca&buttonTextColor=fffffc&iconBg=fffffc&radius=12"
  width="100%"
  height="140"
  loading="lazy"
  title="Soluddy donation widget">
</iframe>
```

## Implementation Checklist

* Use `https` in the iframe `src` to avoid mixed-content warnings.
* Allow third-party iframes in your Content Security Policy if one is enforced.
* Keep the iframe height at 140 pixels or higher to prevent clipping.
* Monitor the referenced campaign so the widget stays in sync with on-chain state.
