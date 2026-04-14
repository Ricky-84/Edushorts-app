import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Video} from '../../types';

interface VideoState {
  videos: Video[];
  loading: boolean;
  currentIndex: number;
}

const initialState: VideoState = {
  videos: [],
  loading: false,
  currentIndex: 0,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideos(state, action: PayloadAction<Video[]>) {
      state.videos = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCurrentIndex(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload;
    },
  },
});

export const {setVideos, setLoading, setCurrentIndex} = videoSlice.actions;
export default videoSlice.reducer;
