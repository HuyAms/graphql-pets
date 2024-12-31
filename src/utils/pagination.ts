import { Node, PageInfo } from "../__generated__/graphql";

type PageEdge<T> = {
  node: T;
  cursor: string;
};

type PageConnection<T extends Node> = {
  pageInfo: PageInfo;
  edges: Array<PageEdge<T>>;
  totalCount: number;
};

export type ConectionArgrs = {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
};

function createEdges<T extends Node>(items: Array<T>): Array<PageEdge<T>> {
  return items.map((item) => ({
    node: item,
    cursor: item.id,
  }));
}

export function createConnection<T extends Node>({
  items,
  connectionArgs,
  totalCount,
}: {
  items: Array<T>;
  connectionArgs: ConectionArgrs;
  totalCount: number;
}): PageConnection<T> {
  const edges = createEdges(items);

  let slicedEdges = edges;

  const { first, last } = connectionArgs;

  if (first) {
    if (first < 0) {
      throw new Error("First must be positive");
    }

    slicedEdges = edges.slice(0, first);
  }

  if (last) {
    if (last < 0) {
      throw new Error("Last must be positive");
    }

    slicedEdges = edges.slice(-last);
  }

  return {
    pageInfo: {
      startCursor: slicedEdges.length > 0 ? slicedEdges[0].cursor : null,
      endCursor:
        slicedEdges.length > 0
          ? slicedEdges[slicedEdges.length - 1].cursor
          : null,
      hasNextPage: edges.length > first,
      hasPreviousPage: edges.length > last,
    },
    edges: slicedEdges,
    totalCount: totalCount,
  };
}
