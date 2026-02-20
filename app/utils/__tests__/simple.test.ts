describe('Simple tests', () => {
  it('1 + 1 = 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

  it('locale values are valid', () => {
    const locales = ['ja', 'en'];
    expect(locales).toContain('ja');
    expect(locales).toContain('en');
    expect(locales.length).toBe(2);
  });
});