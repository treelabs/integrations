import { IncomingMessage } from 'http';
import axios from 'axios';
import { parseRequest, verifyHMAC } from 'http-signature';
import { TREE_GRAPHQL_URL, TREE_CLIENT_SECRET } from '../config';
import { TreeRequest } from '../types';

export const verifyTreeRequest = (req: IncomingMessage): boolean => {
  try {
    const parsed = parseRequest(req, {});
    return verifyHMAC(parsed, TREE_CLIENT_SECRET);
  } catch (err) {
    console.error('Request verification failed: ', err);
    return false;
  }
};

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
