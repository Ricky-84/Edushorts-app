import axios from 'axios';
import {Video} from '../types';

const BASE_URL = 'http://10.0.2.2:3000/api';

export const videoService = {
  getVideos: async (page = 1, limit = 10): Promise<Video[]> => {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {page, limit},
    });
    return response.data.videos;
  },

  getStreamUrl: (id: string): string => {
    return `${BASE_URL}/videos/${id}/stream`;
  },

  updateProgress: async (
    videoId: string,
    watchTime: number,
    completed: boolean,
    token: string,
  ): Promise<void> => {
    await axios.post(
      `${BASE_URL}/videos/${videoId}/progress`,
      {watchTime, completed},
      {headers: {Authorization: `Bearer ${token}`}},
    );
  },
};
