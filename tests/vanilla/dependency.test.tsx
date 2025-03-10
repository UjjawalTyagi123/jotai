import { atom, createStore } from 'jotai/vanilla'

it('can propagate updates with async atom chains', async () => {
  const store = createStore()

  const countAtom = atom(1)
  let resolve = () => {}
  const asyncAtom = atom(async (get) => {
    const count = get(countAtom)
    await new Promise<void>((r) => (resolve = r))
    return count
  })
  const async2Atom = atom((get) => get(asyncAtom))
  const async3Atom = atom((get) => get(async2Atom))

  expect(store.get(async3Atom) instanceof Promise).toBe(true)
  resolve()
  await expect(store.get(async3Atom)).resolves.toBe(1)

  store.set(countAtom, (c) => c + 1)
  expect(store.get(async3Atom) instanceof Promise).toBe(true)
  resolve()
  await expect(store.get(async3Atom)).resolves.toBe(2)

  store.set(countAtom, (c) => c + 1)
  expect(store.get(async3Atom) instanceof Promise).toBe(true)
  resolve()
  await expect(store.get(async3Atom)).resolves.toBe(3)
})
