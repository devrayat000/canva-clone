import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetUserAssets = () => {
  const query = useQuery({
    queryKey: ["user-assets"],
    queryFn: async () => {
      const response = await client.api["user-assets"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch user assets");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
