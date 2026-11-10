import { describe, expect, it } from 'vitest'

import { decodeEntities, htmlToMarkdown, plainText, truncate } from '@/lib/html-to-markdown'

// The shape of a Squarespace post body (from ethicai.au/insights), trimmed.
const SQUARESPACE = `<div class="sqs-layout"><div class="sqs-html-content" data-sqsp-text-block-content>
<p class="" style="white-space:pre-wrap;">Let’s set the record straight: <strong>Ethical AI isn’t soft. It’s strategic.</strong></p>
<p class="" style="white-space:pre-wrap;" data-rte-preserve-empty="true"></p>
<h3 style="white-space:pre-wrap;"><strong>Klarna. Duolingo. Target.</strong></h3>
<p>Three brands.<br>Three bold AI moves.</p>
<ul data-rte-list="default"><li><p class="">Job cuts framed as <em>“efficiency”</em> feel tone-deaf</p></li><li><p>Surveillance &amp; profiling</p></li></ul>
<h4>Smaller heading</h4>
<ol><li>First</li><li>Second</li></ol>
<figure class="sqs-block-image"><img src="https://images.squarespace-cdn.com/x.jpg"><figcaption>Caption</figcaption></figure>
<p>Read <a href="https://example.com/a?b=1&amp;c=2">the <strong>report</strong></a>.</p>
<style>.x{}</style>
</div></div>`

describe('htmlToMarkdown', () => {
  it('converts a Squarespace post body', () => {
    expect(htmlToMarkdown(SQUARESPACE)).toBe(
      [
        'Let’s set the record straight: **Ethical AI isn’t soft. It’s strategic.**',
        '## Klarna. Duolingo. Target.',
        'Three brands. Three bold AI moves.',
        '- Job cuts framed as *“efficiency”* feel tone-deaf\n- Surveillance & profiling',
        '### Smaller heading',
        '1. First\n2. Second',
        'Read [the **report**](https://example.com/a?b=1&c=2).',
      ].join('\n\n'),
    )
  })

  it('keeps spaces outside emphasis markers', () => {
    expect(htmlToMarkdown('<p>a<strong> bold </strong>word</p>')).toBe('a **bold** word')
  })

  it('drops empty emphasis and empty paragraphs', () => {
    expect(htmlToMarkdown('<p><strong> </strong></p><p>Text</p>')).toBe('Text')
  })
})

describe('text helpers', () => {
  it('decodes named and numeric entities', () => {
    expect(decodeEntities('&amp; &#8217; &#x2014; &nbsp;')).toBe('& ’ —  ')
  })

  it('makes plain text from Markdown or HTML', () => {
    expect(plainText('**Bold** and [a link](https://x.y) <em>here</em>')).toBe(
      'Bold and a link here',
    )
  })

  it('truncates at a word boundary', () => {
    expect(truncate('one two three four five', 14)).toBe('one two three…')
    expect(truncate('short', 14)).toBe('short')
  })
})
