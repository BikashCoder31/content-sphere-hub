import sanitizeHtml from 'sanitize-html';
import type { IOptions, Transformer } from 'sanitize-html';

/**
 * HTML sanitization configuration for content
 * Allows safe HTML elements while removing potentially dangerous content
 */
const sanitizeConfig: IOptions = {
  allowedTags: [
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Block elements
    'p', 'div', 'blockquote', 'pre', 'hr',
    // Lists
    'ul', 'ol', 'li',
    // Inline elements
    'span', 'a', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins',
    'sub', 'sup', 'mark', 'small', 'code', 'kbd', 'samp', 'var',
    // Media
    'img', 'figure', 'figcaption', 'video', 'audio', 'source', 'iframe',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col', 'caption',
    // Other
    'br', 'abbr', 'address', 'cite', 'q', 'time', 'details', 'summary',
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'style', 'data-*'],
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    video: ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height'],
    audio: ['src', 'controls', 'autoplay', 'loop', 'muted'],
    source: ['src', 'type'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'],
    table: ['border', 'cellpadding', 'cellspacing'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    col: ['span', 'width'],
    time: ['datetime'],
    abbr: ['title'],
    q: ['cite'],
    blockquote: ['cite'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
    video: ['http', 'https'],
    audio: ['http', 'https'],
    source: ['http', 'https'],
    iframe: ['https'], // Only HTTPS for iframes (security)
  },
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
    'www.dailymotion.com',
    'codepen.io',
    'codesandbox.io',
    'stackblitz.com',
    'jsfiddle.net',
    'gist.github.com',
    'docs.google.com',
    'drive.google.com',
    'www.figma.com',
    'embed.figma.com',
    'open.spotify.com',
  ],
  transformTags: {
    a: ((tagName: string, attribs: Record<string, string>) => {
      // Add rel="noopener noreferrer" to external links
      if (attribs.href && !attribs.href.startsWith('/') && !attribs.href.startsWith('#')) {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: attribs.target || '_blank',
            rel: 'noopener noreferrer',
          },
        };
      }
      return { tagName, attribs };
    }) as Transformer,
    img: ((tagName: string, attribs: Record<string, string>) => {
      // Add loading="lazy" to images
      return {
        tagName,
        attribs: {
          ...attribs,
          loading: attribs.loading || 'lazy',
        },
      };
    }) as Transformer,
  },
  // Allow safe inline styles
  allowedStyles: {
    '*': {
      'color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(\d+,\s*\d+,\s*\d+\)$/i, /^[a-z]+$/i],
      'background-color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(\d+,\s*\d+,\s*\d+\)$/i, /^[a-z]+$/i],
      'text-align': [/^(left|center|right|justify)$/i],
      'font-weight': [/^(normal|bold|[1-9]00)$/i],
      'font-style': [/^(normal|italic)$/i],
      'text-decoration': [/^(none|underline|line-through)$/i],
      'font-size': [/^\d+(px|em|rem|%)$/i],
      'width': [/^\d+(px|em|rem|%)$/i],
      'height': [/^\d+(px|em|rem|%)$/i],
      'max-width': [/^\d+(px|em|rem|%)$/i],
      'max-height': [/^\d+(px|em|rem|%)$/i],
      'margin': [/^[\d\s]+(px|em|rem|%|auto)+$/i],
      'padding': [/^[\d\s]+(px|em|rem|%)+$/i],
    },
  },
};

/**
 * Sanitize HTML content for safe storage and display
 */
export function sanitizeContent(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return sanitizeHtml(html, sanitizeConfig);
}

/**
 * Stricter sanitization for user-generated comments
 */
export function sanitizeComment(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li'],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: ((tagName: string, attribs: Record<string, string>) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      })) as Transformer,
    },
  });
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export default sanitizeContent;
