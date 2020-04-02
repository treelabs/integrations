import axios from 'axios';
import { TREE_GRAPHQL_URL } from '../config';
import { TreeRequest } from '../types';

export const getSpaceSlug = async (req: TreeRequest): Promise<string> => {
  try {
    const response = await axios.post(
      TREE_GRAPHQL_URL,
      {
        query: `
query ($spaceId: ID!) {
  space(spaceId: $spaceId) {
    space {
      slug
    }
  }
}
`,
        variables: {
          spaceId: req.spaceId
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${req.accessToken}`
        }
      }
    );

    return response.data.data.space.space.slug;
  } catch (err) {
    console.error('Space fetch error: ', err);
    throw new Error('Failed to fetch space');
  }
};
