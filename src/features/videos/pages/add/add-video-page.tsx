import { useNavigate } from 'react-router-dom';

import { VideoForm } from 'features/videos/pages/add/video-form';

export const AddVideoPage = () => {
  const navigate = useNavigate();

  return <VideoForm mode="create" onSubmit={() => navigate('/')} onCancel={() => navigate(-1)} />;
};
