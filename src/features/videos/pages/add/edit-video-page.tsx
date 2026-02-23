import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { ProcessedVideo, Video } from 'common/interfaces';
import { getVideoWithAuthor } from 'features/videos/services';
import { VideoForm } from 'features/videos/pages/add/video-form';

export const EditVideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(null);
  const [authorId, setAuthorId] = useState<number | null>(null);
  const videoId = Number(id);

  useEffect(() => {
    if (!Number.isFinite(videoId)) return;
    getVideoWithAuthor(videoId).then((result) => {
      if (!result) return;
      setVideo(result.video);
      setAuthorId(result.author.id);
      setProcessedVideo({
        id: result.video.id,
        name: result.video.name,
        author: result.author.name,
        highestQualityFormat: '',
        releaseDate: result.video.releaseDate,
        categories: [], // not used in defaults; categories come from catIds
      });
    });
  }, [videoId]);

  return (
    <VideoForm
      mode="edit"
      video={processedVideo ?? undefined}
      initialVideo={video ?? undefined}
      initialAuthorId={authorId ?? undefined}
      onSubmit={() => navigate('/')}
      onCancel={() => navigate(-1)}
    />
  );
};
