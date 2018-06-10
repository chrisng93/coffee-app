export const getRequest = <T>(url: string): Promise<T> => {
  return fetch(url)
    .then(response => response.json())
    .catch(err => { throw new Error(err) })
}
