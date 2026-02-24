import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { ProcessedVideo, Video } from 'common/interfaces';
import { getVideoWithAuthor } from 'features/videos/services/videos';
import { toErrorMessage } from 'shared/utils/errors';
import { VideoForm } from 'features/videos/components/video-form';

export const EditVideoPage = () => {
  const { id, authorId: authorIdParam } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(null);
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoId = Number(id);
  const parsedAuthorId = Number(authorIdParam);

  useEffect(() => {
    // Route includes both authorId and id so edit always resolves the exact video record.
    if (!Number.isFinite(videoId) || !Number.isFinite(parsedAuthorId)) {
      setError('Invalid video id.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getVideoWithAuthor(parsedAuthorId, videoId);
        if (!isMounted) return;
        if (!result) {
          setError('Video not found.');
          return;
        }
        setVideo(result.video);
        setAuthorId(result.author.id);
        setProcessedVideo({
          id: result.video.id,
          authorId: result.author.id,
          name: result.video.name,
          author: result.author.name,
          highestQualityFormat: '',
          releaseDate: result.video.releaseDate,
          categories: [], // not used in defaults; categories come from catIds
        });
      } catch (loadError) {
        if (!isMounted) return;
        setError(toErrorMessage(loadError, 'Failed to load video.'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadVideo();

    return () => {
      isMounted = false;
    };
  }, [videoId, parsedAuthorId]);

  if (isLoading) {
    return <p>Loading video...</p>;
  }

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    );
  }

  if (!video || !processedVideo || authorId === null) {
    return (
      <div>
        <p role="alert">Video not found.</p>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <VideoForm
      mode="edit"
      video={processedVideo}
      initialVideo={video}
      initialAuthorId={authorId}
      onSubmit={() => navigate('/')}
      onCancel={() => navigate(-1)}
    />
  );
};
