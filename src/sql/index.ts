export class queries {
  orderEmptyStringsLast: string = "NULLIF(bookmark.title,' ') DESC NULLS LAST";
}
