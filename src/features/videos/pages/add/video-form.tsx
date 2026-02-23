import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import type { ProcessedVideo, Video } from 'common/interfaces';
import { getCategories, getAuthors, addVideoToAuthor, updateVideo, getMaxVideoIdForAuthor } from 'features/videos/services';
import { Button } from 'components/button';
import { Select } from 'components/select';
import styles from 'features/videos/styles/video-page.module.css';

type VideoFormProps = {
  mode: 'create' | 'edit';
  video?: ProcessedVideo;
  initialVideo?: Video;
  initialAuthorId?: number;
  onSubmit?: (payload: { name: string; author: string; categories: Array<string | number> }) => void;
  onCancel?: () => void;
};

type FormValues = {
  name: string;
  author: string;
  categories: Array<string | number>;
};

export const VideoForm = ({ mode, video, initialVideo, initialAuthorId, onSubmit, onCancel }: VideoFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, touchedFields, isSubmitted },
  } = useForm<FormValues>({
    defaultValues: {
      name: video?.name ?? initialVideo?.name ?? '',
      author: video?.author ?? (initialAuthorId ? String(initialAuthorId) : ''),
      categories: initialVideo?.catIds ?? video?.categories ?? [],
    },
    mode: 'onChange',
    reValidateMode: 'onBlur',
  });
  const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [authorOptions, setAuthorOptions] = useState<Array<{ label: string; value: number }>>([]);
  const currentAuthor = watch('author');

  const title = useMemo(() => (mode === 'create' ? 'Add Video' : 'Edit video'), [mode]);

  useEffect(() => {
    getCategories().then((cats) => setCategoryOptions(cats.map((c) => ({ label: c.name, value: c.id }))));
    getAuthors().then((auths) => setAuthorOptions(auths.map((a) => ({ label: a.name, value: a.id }))));
  }, []);

  useEffect(() => {
    reset({
      name: initialVideo?.name ?? video?.name ?? '',
      author: initialAuthorId ? String(initialAuthorId) : (video?.author ?? ''),
      categories: initialVideo?.catIds ?? video?.categories ?? [],
    });
  }, [initialVideo, initialAuthorId, video, reset]);

  useEffect(() => {
    if (!currentAuthor && authorOptions.length > 0) {
      setValue('author', String(authorOptions[0].value));
    }
  }, [currentAuthor, authorOptions, setValue]);

  const onSubmitForm = handleSubmit(async (values) => {
    const targetAuthorId = Number(values.author);
    const categoryIds = Array.isArray(values.categories)
      ? values.categories.map((c) => Number(c))
      : values.categories
        ? [Number(values.categories)]
        : [];

    if (mode === 'edit' && initialVideo) {
      const updatedVideo: Video = {
        ...initialVideo,
        name: values.name,
        catIds: categoryIds,
      };
      await updateVideo(initialVideo.id, updatedVideo, targetAuthorId);
      console.info('Video updated successfully');
      onSubmit?.(values);
      return;
    }

    const videoId = (await getMaxVideoIdForAuthor(targetAuthorId)) + 1;
    const newVideo: Video = {
      id: videoId,
      name: values.name,
      catIds: categoryIds,
      formats: {
        one: { res: '1080p', size: 1000 },
      },
      releaseDate: new Date().toISOString().slice(0, 10),
    };

    await addVideoToAuthor(targetAuthorId, newVideo);
    console.info('Video added successfully');
    onSubmit?.(values);
  });

  return (
    <form className={styles.form} onSubmit={onSubmitForm}>
      <h1>{title}</h1>

      <label className={styles['form-row']}>
        <span className={styles['form-label']}>Video name</span>
        <div className={styles['form-field']}>
          <input className={styles['form-input']} type="text" {...register('name', { required: 'Name is required' })} />
          {errors.name && (touchedFields.name || isSubmitted) && <span className={styles.error}>{errors.name.message}</span>}
        </div>
      </label>

      <label className={styles['form-row']}>
        <span className={styles['form-label']}>Video author</span>
        <Controller
          control={control}
          name="author"
          rules={{ required: 'Author is required' }}
          render={({ field }) => (
            <div className={styles['form-field']}>
              <Select
                options={authorOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={styles['form-input']}
              />
              {errors.author && (touchedFields.author || isSubmitted) && (
                <span className={styles.error}>{errors.author.message as string}</span>
              )}
            </div>
          )}
        />
      </label>

      <label className={styles['form-row']}>
        <span className={styles['form-label']}>Video categories</span>
        <Controller
          control={control}
          name="categories"
          rules={{ validate: (vals) => (vals?.length ? true : 'At least one category is required') }}
          render={({ field }) => (
            <div className={styles['form-field']}>
              <Select
                multiple
                options={categoryOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={styles['form-input']}
              />
              {errors.categories && (touchedFields.categories || isSubmitted) && (
                <span className={styles.error}>{errors.categories.message as string}</span>
              )}
            </div>
          )}
        />
      </label>

      <div className={styles.actions}>
        <span className={styles['form-label']}></span>
        <Button type="submit" primary disabled={!isValid}>
          Submit
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
