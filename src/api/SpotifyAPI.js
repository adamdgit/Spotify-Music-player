import axios from "axios";

export async function SpotifyAPI(url, method, token, params) {

  let result = undefined;
  let errorMsg = false;

  const fetchParams = {
    method: method,
    url: url,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(params?.data && {data: params.data}),
    ...(params?.params && {params: params.params}),
    ...(params?.market && {market: params.market}),
  };
  
  await axios(fetchParams)
    .then(data => result = data)
    .catch(error => errorMsg = error);
  
  return { result, errorMsg }
}