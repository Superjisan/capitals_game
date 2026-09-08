import { assert, assertEquals, assertMatch } from 'jsr:@std/assert@1';

const css = (await Deno.readTextFile(new URL('../styles.css', import.meta.url)))
  .replace(/\/\*[\s\S]*?\*\//g, '');

const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
  selector: selector.trim(),
  body: body.trim(),
}));

const rule = (selector) => rules.find((candidate) => candidate.selector === selector);

const declaration = (body, property) => {
  const match = body.match(new RegExp(`(?:^|;)\\s*${property}:\\s*([^;]+)`));
  return match ? match[1].trim() : null;
};

Deno.test('the answer input is beveled and reads larger than the body text', () => {
  const answer = rule('#answer');
  assert(answer, 'styles.css needs an #answer rule');

  assertMatch(answer.body, /box-shadow:[^;]*inset/);
  assert(parseFloat(declaration(answer.body, 'border')) >= 2, 'the bevel needs a visible border');
  assert(parseFloat(declaration(answer.body, 'font-size')) > 1, 'the typed answer should read larger than 1rem');
  assertEquals(declaration(answer.body, 'width'), '100%', 'the input fills its wrapper rather than a fixed width');
});

Deno.test('the answer input picks up a focus ring', () => {
  const focused = rule('#answer:focus');
  assert(focused, '#answer:focus needs its own rule');
  assertEquals(declaration(focused.body, 'outline'), 'none', 'the default outline is replaced, not doubled up');
  assertMatch(declaration(focused.body, 'box-shadow'), /0 0 0 3px/);
});

Deno.test('the answer input spans exactly what submit and skip span together', () => {
  const wideButton = rules.find((candidate) =>
    candidate.selector === '#buttons-div > button' && /max-width:\s*[\d.]+rem/.test(candidate.body));
  const buttonRow = rules.find((candidate) =>
    candidate.selector === '#buttons-div' && declaration(candidate.body, 'gap'));
  const wideInput = rules.find((candidate) =>
    candidate.selector === '#input-div' && /min\(100%/.test(candidate.body));

  assert(wideButton, 'the wide layout still needs a capped button width');
  assert(buttonRow, '#buttons-div still needs a gap between the two buttons');
  assert(wideInput, '#input-div needs a width matching that button row');

  const buttonWidth = parseFloat(declaration(wideButton.body, 'max-width'));
  const gap = parseFloat(declaration(buttonRow.body, 'gap'));
  const inputWidth = parseFloat(declaration(wideInput.body, 'width').match(/min\(100%,\s*([\d.]+)rem/)[1]);

  assertEquals(inputWidth, buttonWidth * 2 + gap);
});

Deno.test('the dropdown hangs off the input rather than pushing the page around', () => {
  const wrapper = rule('#answer-wrapper');
  assert(wrapper, '#answer-wrapper anchors the dropdown');
  assertEquals(declaration(wrapper.body, 'position'), 'relative');

  const suggestions = rule('.answer-suggestions');
  assert(suggestions, 'styles.css needs an .answer-suggestions rule');
  assertEquals(declaration(suggestions.body, 'position'), 'absolute');
  assertEquals(declaration(suggestions.body, 'top'), '100%', 'the list opens directly below the input');
  assertEquals(declaration(suggestions.body, 'width'), '100%', 'the list is as wide as the input');
  assert(parseFloat(declaration(suggestions.body, 'z-index')) > 0, 'the list has to sit above the buttons below it');
});

Deno.test('a long list of matches scrolls instead of running off the page', () => {
  const suggestions = rule('.answer-suggestions');
  assert(parseFloat(declaration(suggestions.body, 'max-height')) > 0, 'the list needs a capped height');
  assertEquals(declaration(suggestions.body, 'overflow-y'), 'auto');
});

Deno.test('the hidden dropdown really is hidden', () => {
  const hiddenSuggestions = rule('.answer-suggestions[hidden]');
  assert(hiddenSuggestions, '.answer-suggestions sets its own display, so it needs a [hidden] override');
  assertEquals(declaration(hiddenSuggestions.body, 'display'), 'none');

  const globalHidden = rule('[hidden]');
  assert(globalHidden, 'styles.css needs a bare [hidden] rule');
  assertMatch(globalHidden.body, /display:\s*none\s*!important/);
});

Deno.test('suggestions look clickable and the highlighted one stands out', () => {
  const suggestion = rule('.capital-suggestion');
  assert(suggestion, 'styles.css needs a .capital-suggestion rule');
  assertEquals(declaration(suggestion.body, 'cursor'), 'pointer');
  assertEquals(declaration(suggestion.body, 'text-align'), 'left');

  const highlighted = rules.find((candidate) =>
    candidate.selector.split(',').map((part) => part.trim()).includes('.capital-suggestion.active'));
  assert(highlighted, 'the keyboard-highlighted suggestion needs a rule');
  assert(declaration(highlighted.body, 'background'), 'the highlight is a background change');
  assert(
    highlighted.selector.includes('.capital-suggestion:hover'),
    'keyboard highlight and mouse hover should look the same'
  );
});
