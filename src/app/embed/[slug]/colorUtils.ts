const HEX_REGEX = /^#([0-9A-Fa-f]{3}){1,2}$/;

/**
 * Normalizes a color value to a hex string, applying a fallback when validation fails.
 *
 * @param value Query parameter representing a color.
 * @param fallback Default color to return when the input is missing or invalid.
 * @returns Sanitized color string.
 */
export const formatColor = (value: string | null, fallback: string) => {
  if (!value) return fallback;
  let color = decodeURIComponent(value);
  if (!color.startsWith('#')) {
    color = `#${color}`;
  }
  if (HEX_REGEX.test(color)) {
    return color;
  }
  return fallback;
};

/**
 * Normalizes a border-radius value, appending pixel units when the input is numeric-only.
 *
 * @param value Query parameter representing a CSS radius value.
 * @param fallback Default radius to return when validation fails.
 * @returns Sanitized radius value.
 */
export const formatRadius = (value: string | null, fallback: string) => {
  if (!value) return fallback;
  const decoded = decodeURIComponent(value);
  if (/^\d+(px|rem|em|%)?$/.test(decoded)) {
    if (/^\d+$/.test(decoded)) {
      return `${decoded}px`;
    }
    return decoded;
  }
  return fallback;
};
