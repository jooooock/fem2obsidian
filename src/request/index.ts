// deno-lint-ignore-file no-explicit-any

import { UserAgent, Referer, Origin } from "./config.ts";
import {cookieManager} from "./cookie.ts";


function stringifyQuery(
  query: Record<string, string | number | boolean> = {},
): Record<string, string> {
  const data: Record<string, string> = {};
  Object.keys(query).reduce((obj, key) => {
    obj[key] = query[key].toString();
    return obj;
  }, data);
  return data;
}

export async function get(
  url: string,
  query: Record<string, string | number> = {},
  header: Record<string, string> = {},
  timeout = 60 * 1000 * 2
) {
  if (Object.keys(query).length) {
    url += "?" + new URLSearchParams(stringifyQuery(query)).toString();
  }

  const cookies = cookieManager.query(url)

  const headers: Record<string, string> = {
    "User-Agent": UserAgent,
    "Referer": Referer,
    "Origin": Origin,
    "Cookie": cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';'),
    ...header,
  };

  const controller = new AbortController();

  const id = setTimeout(() => {
    controller.abort()
  }, timeout)

  const resp = await fetch(url, {
    method: "GET",
    cache: "no-cache",
    headers,
    signal: controller.signal,
  });

  clearTimeout(id);
  return resp;
}

function post(
  url: string,
  data: Record<string, any> = {},
  format = "json",
  header: Record<string, string> = {},
  timeout = 60 * 1000 * 2
) {
  const cookies = cookieManager.query(url)

  let body;
  const headers: Record<string, string> | undefined = {
    "User-Agent": UserAgent,
    "Referer": Referer,
    "Origin": Origin,
    "Cookie": cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';'),
    ...header,
  };

  if (format === "query" && Object.keys(data).length) {
    url += "?" + new URLSearchParams(stringifyQuery(data)).toString();
    body = undefined;
  } else if (format === "json") {
    body = JSON.stringify(data);
    headers["Content-Type"] = "application/json";
  } else if (format === "form-data") {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    body = formData;
  }

  const controller = new AbortController();

  const id = setTimeout(() => {
    controller.abort()
  }, timeout)

  const resp = fetch(url, {
    method: "POST",
    cache: "no-store",
    body,
    headers,
    signal: controller.signal,
  });
  clearTimeout(id);
  return resp;
}

export function postJSON(
  url: string,
  data: Record<string, any> = {},
  headers: Record<string, string> = {},
) {
  return post(url, data, "json", headers);
}

export function postQuery(
  url: string,
  data: Record<string, string | number | boolean> = {},
  headers: Record<string, string> = {},
) {
  return post(url, data, "query", headers);
}

export function postFormData(
  url: string,
  data: Record<string, string | number | boolean> = {},
  headers: Record<string, string> = {},
) {
  return post(url, data, "form-data", headers);
}

export function head(
    url: string,
    query: Record<string, string | number> = {},
    header: Record<string, string> = {},
    timeout = 60 * 1000 * 2
) {
  if (Object.keys(query).length) {
    url += "?" + new URLSearchParams(stringifyQuery(query)).toString();
  }

  const cookies = cookieManager.query(url)

  const headers: Record<string, string> = {
    "User-Agent": UserAgent,
    "Referer": Referer,
    "Origin": Origin,
    "Cookie": cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';'),
    ...header,
  };

  const controller = new AbortController();

  const id = setTimeout(() => {
    controller.abort()
  }, timeout)

  const resp = fetch(url, {
    method: "HEAD",
    cache: "default",
    headers,
    signal: controller.signal,
  });

  clearTimeout(id);
  return resp;
}
