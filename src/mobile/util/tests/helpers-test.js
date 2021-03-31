import { assert } from 'chai'
import { normalizePathHelper, insertExternalLinkIconHelper, truncateTextHelper } from '~/src/mobile/util/helpers'
import 'steal-mocha'

describe('helpers module', function () {
  describe('insertExternalLinkIconHelper', function () {
    it('adds span with glyphicon icon to external links', () => {
      const questionHTML = `<a href="http:www.bitovi.com>Bitovi.com</a>`
      const outputHTML = insertExternalLinkIconHelper(questionHTML)
      assert.equal(outputHTML, '<a href="http:www.bitovi.com>Bitovi.com <span class="glyphicon-link-ext" aria-hidden="true"/></a>', 'should add span for external link icon from fontello')
    })

    it('does not add span with internal popup links', () => {
      const questionHTML = `<a href="POPUP://somePopup">popup text</a>`
      const outputHTML = insertExternalLinkIconHelper(questionHTML)
      assert.equal(outputHTML, questionHTML, 'should not add span for internal popup links')
    })

    it('handles html being undefined', () => {
      const questionHTML = undefined
      const outputHTML = insertExternalLinkIconHelper(questionHTML)
      assert.equal(outputHTML, questionHTML, 'should do nothing if html is undefined')
    })

    it('handles html being null', () => {
      const questionHTML = null
      const outputHTML = insertExternalLinkIconHelper(questionHTML)
      assert.equal(outputHTML, questionHTML, 'should do nothing if html is null')
    })
  })

  describe('normalizePathHelper', function () {
    const pathToGuide = '/userfiles/user/guide/'
    const fullyQualifiedPathToGuide = 'http://www.cali.org/userfiles/user/guide/'

    it('returns empty string with invalid parameters', function () {
      assert.equal(normalizePathHelper(), '')
      assert.equal(normalizePathHelper('foo', null), '')
      assert.equal(normalizePathHelper(null, 'foo'), '')
    })

    it('keeps urls', function () {
      let url = 'http://some/folder/file.xxx'
      assert.equal(normalizePathHelper(pathToGuide, url), url)
    })

    it('keeps fully qualified guide path', function () {
      let file = 'buds.jpg'
      assert.equal(normalizePathHelper(fullyQualifiedPathToGuide, file), 'http://www.cali.org/userfiles/user/guide/buds.jpg')
    })

    it('replaces the file path with path provided as first argument', function () {
      let path = 'C:\\Users\\dev\\Documents\\logo.jpg'
      assert.equal(normalizePathHelper(pathToGuide, path), '/userfiles/user/guide/logo.jpg')

      path = '/Users/dev/Sites/file.xml'
      assert.equal(normalizePathHelper(pathToGuide, path), '/userfiles/user/guide/file.xml')
    })
  })

  describe('truncateText', function () {
    it('keeps short text unchanged', () => {
      let shortText = 'Foo Test'
      assert.equal(truncateTextHelper(shortText), 'Foo Test', 'should not change short text')
    })

    it('truncates long texts', function () {
      let longText = 'slightly longer text with a space as the 51st char that gets truncated'
      assert.equal(
        truncateTextHelper(longText),
        'slightly longer text with a space as the 51st char...',
        'should truncate to 50 chars and add an ellipsis'
      )
    })

    it('truncates the space in after 50th character', function () {
      let step = 'long text with a space as the 50th character in the middle of a word'
      assert.equal(
        truncateTextHelper(step),
        'long text with a space as the 50th character in...',
        'should truncate to last full word before 50th char and add an ellipsis'
      )
    })
  })
})
