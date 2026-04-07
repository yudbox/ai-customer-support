/**
 * Next Request Factory for testing
 *
 * Фабрика для создания mock объектов NextRequest
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

import type { NextRequest } from "next/server";

export const nextRequestFactory = Factory.define<NextRequest>(() => {
  const url = faker.internet.url();
  const parsedUrl = new URL(url);

  // Create cookies object with proper return types
  const cookiesMap = new Map();
  const cookies = {
    get: (name: string) => cookiesMap.get(name),
    getAll: (name?: string) => {
      if (name) {
        const cookie = cookiesMap.get(name);
        return cookie ? [cookie] : [];
      }
      return Array.from(cookiesMap.values());
    },
    has: (name: string) => cookiesMap.has(name),
    set: function (name: string, value: string) {
      cookiesMap.set(name, { name, value });
      return this;
    },
    delete: (name: string) => cookiesMap.delete(name),
    clear: function () {
      cookiesMap.clear();
      return this;
    },
    get size() {
      return cookiesMap.size;
    },
    [Symbol.iterator]: function* () {
      yield* cookiesMap.entries();
    },
  };

  // Create NextURL mock with all required methods
  const nextUrl = {
    searchParams: new URLSearchParams(),
    href: url,
    origin: parsedUrl.origin,
    protocol: parsedUrl.protocol,
    username: parsedUrl.username,
    password: parsedUrl.password,
    host: parsedUrl.host,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    pathname: parsedUrl.pathname,
    search: parsedUrl.search,
    hash: parsedUrl.hash,
    toString: () => url,
    toJSON: () => url,
    clone: function () {
      return this;
    },
    analyze: () => ({
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      searchParams: new URLSearchParams(),
    }),
    formatPathname: () => parsedUrl.pathname,
    formatSearch: () => parsedUrl.search,
    buildId: undefined,
    locale: undefined,
    defaultLocale: undefined,
    domainLocale: undefined,
    basePath: "",
    [Symbol.for("NextURLInternal")]: {},
  };

  // Create a proper NextRequest mock without type casting
  const mockRequest = {
    nextUrl,
    url,
    method: faker.helpers.arrayElement([
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
    ]),
    headers: new Headers({
      "content-type": "application/json",
      "user-agent": faker.internet.userAgent(),
    }),
    body: null,
    bodyUsed: false,
    cache: "default" as RequestCache,
    credentials: "same-origin" as RequestCredentials,
    destination: "" as RequestDestination,
    integrity: "",
    keepalive: false,
    mode: "cors" as RequestMode,
    redirect: "follow" as RequestRedirect,
    referrer: "",
    referrerPolicy: "" as ReferrerPolicy,
    signal: new AbortController().signal,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    json: async () => ({}),
    text: async () => "",
    clone: function () {
      return this;
    },
    cookies,
    geo: {
      city: faker.location.city(),
      country: faker.location.countryCode(),
      region: faker.location.state(),
      latitude: faker.location.latitude().toString(),
      longitude: faker.location.longitude().toString(),
    },
    ip: faker.internet.ip(),
    page: undefined,
    ua: undefined,
    bytes: undefined,
  };

  return mockRequest as unknown as NextRequest;
});
