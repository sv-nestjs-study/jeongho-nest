'use client';

import { FormEvent, useEffect, useState } from 'react';

type Tokens = { accessToken: string; refreshToken: string };
type AuthUser = { sub: number };
type PostSummary = {
  id: number;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
};
type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; nickname: string };
};
type PostDetail = PostSummary & { comments: Comment[] };
type AuthMode = 'login' | 'signup' | null;
type PostForm = { title: string; content: string; authorName: string };

const accessTokenStorageKey = 'board-api-access-token';
const refreshTokenStorageKey = 'board-api-refresh-token';
const emptyPostForm: PostForm = { title: '', content: '', authorName: '' };

function getStoredToken(storageKey: string): string {
  if (typeof window === 'undefined') return '';

  return window.localStorage.getItem(storageKey) ?? '';
}

function App() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [accessToken, setAccessToken] = useState(() =>
    getStoredToken(accessTokenStorageKey),
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    getStoredToken(refreshTokenStorageKey),
  );
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [signUp, setSignUp] = useState({
    email: '',
    nickname: '',
    password: '',
  });
  const [login, setLogin] = useState({ email: '', password: '' });
  const [postForm, setPostForm] = useState<PostForm>(emptyPostForm);
  const [commentContent, setCommentContent] = useState('');

  const saveTokens = (tokens: Tokens) => {
    window.localStorage.setItem(accessTokenStorageKey, tokens.accessToken);
    window.localStorage.setItem(refreshTokenStorageKey, tokens.refreshToken);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
  };

  const logout = () => {
    window.localStorage.removeItem(accessTokenStorageKey);
    window.localStorage.removeItem(refreshTokenStorageKey);
    setAccessToken('');
    setRefreshToken('');
    setCurrentUser(null);
    setNotice('로그아웃했습니다.');
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      logout();
      return null;
    }

    const tokens = (await response.json()) as Tokens;
    saveTokens(tokens);
    return tokens.accessToken;
  };

  const apiRequest = async (
    path: string,
    options: RequestInit = {},
    requiresAuth = false,
    allowRetry = true,
  ): Promise<Response> => {
    const headers = new Headers(options.headers);
    if (requiresAuth && accessToken)
      headers.set('Authorization', `Bearer ${accessToken}`);

    let response = await fetch(`/api${path}`, { ...options, headers });

    if (response.status === 401 && requiresAuth && allowRetry) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(`/api${path}`, { ...options, headers });
      }
    }

    return response;
  };

  const requestJson = async <T,>(
    path: string,
    options: RequestInit = {},
    requiresAuth = false,
  ): Promise<T> => {
    const response = await apiRequest(path, options, requiresAuth);
    const responseText = await response.text();
    const body = responseText ? (JSON.parse(responseText) as unknown) : null;
    if (!response.ok) throw new Error(getErrorMessage(body));
    return body as T;
  };

  const loadPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      setPosts(await requestJson<PostSummary[]>('/posts'));
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      setCurrentUser(await requestJson<AuthUser>('/auth/me', {}, true));
    } catch {
      logout();
    }
  };

  const openPost = async (postId: number) => {
    setIsLoading(true);
    setError('');
    try {
      const post = await requestJson<PostDetail>(`/posts/${postId}`);
      setSelectedPost(post);
      setIsEditing(false);
      setPostForm({
        title: post.title,
        content: post.content,
        authorName: post.authorName,
      });
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  const returnToList = () => {
    setSelectedPost(null);
    setIsWriting(false);
    setIsEditing(false);
    setPostForm(emptyPostForm);
    void loadPosts();
  };

  const submitSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await requestJson('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUp),
      });
      setNotice('회원가입이 완료되었습니다. 로그인해주세요.');
      setLogin({ email: signUp.email, password: '' });
      setAuthMode('login');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const tokens = await requestJson<Tokens>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      saveTokens(tokens);
      setAuthMode(null);
      setNotice('로그인했습니다. 이제 댓글을 작성할 수 있습니다.');
      await loadCurrentUser();
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  };

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const createdPost = await requestJson<PostDetail>('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm),
      });
      setNotice('게시글을 등록했습니다.');
      setIsWriting(false);
      await openPost(createdPost.id);
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  };

  const submitPostUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPost) return;
    setError('');
    try {
      const updatedPost = await requestJson<PostDetail>(
        `/posts/${selectedPost.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: postForm.title,
            content: postForm.content,
          }),
        },
      );
      setSelectedPost({ ...updatedPost, comments: selectedPost.comments });
      setIsEditing(false);
      setNotice('게시글을 수정했습니다.');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  };

  const deletePost = async () => {
    if (!selectedPost || !window.confirm('게시글을 삭제할까요?')) return;
    setError('');
    try {
      await requestJson(`/posts/${selectedPost.id}`, { method: 'DELETE' });
      setNotice('게시글을 삭제했습니다.');
      returnToList();
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPost) return;
    if (!accessToken) {
      setAuthMode('login');
      return;
    }
    setError('');
    try {
      await requestJson<Comment>(
        `/posts/${selectedPost.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: commentContent }),
        },
        true,
      );
      setCommentContent('');
      setNotice('댓글을 등록했습니다.');
      await openPost(selectedPost.id);
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!selectedPost || !window.confirm('댓글을 삭제할까요?')) return;
    setError('');
    try {
      await requestJson(
        `/posts/${selectedPost.id}/comments/${commentId}`,
        { method: 'DELETE' },
        true,
      );
      setNotice('댓글을 삭제했습니다.');
      await openPost(selectedPost.id);
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  };

  useEffect(() => {
    void loadPosts();
    if (accessToken) void loadCurrentUser();
  }, []);

  return (
    <main className="app-shell antialiased">
      <header className="site-header">
        <button className="brand" type="button" onClick={returnToList}>
          <span>nest board</span>
          <strong>간단한 게시판</strong>
        </button>
        <nav>
          {currentUser ? (
            <>
              <span className="user-label">회원 #{currentUser.sub}</span>
              <button className="text-button" type="button" onClick={logout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                className="text-button"
                type="button"
                onClick={() => setAuthMode('login')}
              >
                로그인
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => setAuthMode('signup')}
              >
                회원가입
              </button>
            </>
          )}
        </nav>
      </header>

      {(notice || error) && (
        <div className={`notice ${error ? 'notice-error' : ''}`}>
          {error || notice}
          <button
            type="button"
            onClick={() => {
              setError('');
              setNotice('');
            }}
          >
            닫기
          </button>
        </div>
      )}

      {selectedPost ? (
        <section className="post-detail">
          <button className="back-button" type="button" onClick={returnToList}>
            ← 목록으로
          </button>
          {isEditing ? (
            <PostEditor
              title="게시글 수정"
              form={postForm}
              onChange={setPostForm}
              onSubmit={submitPostUpdate}
              submitLabel="수정 완료"
              showAuthor={false}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <article className="post-content">
                <div className="post-meta">
                  {selectedPost.authorName} ·{' '}
                  {formatDate(selectedPost.createdAt)} · 조회{' '}
                  {selectedPost.viewCount}
                </div>
                <h1>{selectedPost.title}</h1>
                <p>{selectedPost.content}</p>
                <div className="post-actions">
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    수정
                  </button>
                  <button
                    className="text-button danger-text"
                    type="button"
                    onClick={deletePost}
                  >
                    삭제
                  </button>
                </div>
              </article>
              <section className="comments-section">
                <h2>댓글 {selectedPost.comments.length}</h2>
                {currentUser ? (
                  <form className="comment-form" onSubmit={submitComment}>
                    <textarea
                      placeholder="댓글을 남겨주세요."
                      value={commentContent}
                      onChange={(event) =>
                        setCommentContent(event.target.value)
                      }
                      required
                    />
                    <button className="primary-button" type="submit">
                      등록
                    </button>
                  </form>
                ) : (
                  <button
                    className="login-prompt"
                    type="button"
                    onClick={() => setAuthMode('login')}
                  >
                    로그인하고 댓글 남기기
                  </button>
                )}
                <div className="comment-list">
                  {selectedPost.comments.length === 0 ? (
                    <p className="empty-state">아직 댓글이 없습니다.</p>
                  ) : (
                    selectedPost.comments.map((comment) => (
                      <article className="comment-item" key={comment.id}>
                        <div>
                          <strong>{comment.author.nickname}</strong>
                          <span>{formatDate(comment.createdAt)}</span>
                        </div>
                        <p>{comment.content}</p>
                        {currentUser?.sub === comment.author.id && (
                          <button
                            className="text-button danger-text"
                            type="button"
                            onClick={() => deleteComment(comment.id)}
                          >
                            삭제
                          </button>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </section>
      ) : isWriting ? (
        <section className="post-detail">
          <button className="back-button" type="button" onClick={returnToList}>
            ← 목록으로
          </button>
          <PostEditor
            title="새 게시글"
            form={postForm}
            onChange={setPostForm}
            onSubmit={submitPost}
            submitLabel="등록하기"
            onCancel={returnToList}
          />
        </section>
      ) : (
        <section className="post-list-section">
          <div className="list-heading">
            <div>
              <p>자유롭게 글을 남기고 댓글로 이야기해보세요.</p>
              <h1>게시글</h1>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={() => setIsWriting(true)}
            >
              글쓰기
            </button>
          </div>
          {isLoading ? (
            <p className="empty-state">게시글을 불러오는 중입니다.</p>
          ) : (
            <div className="post-list">
              {posts.length === 0 ? (
                <p className="empty-state">첫 번째 게시글을 작성해보세요.</p>
              ) : (
                posts.map((post) => (
                  <button
                    className="post-card"
                    type="button"
                    key={post.id}
                    onClick={() => void openPost(post.id)}
                  >
                    <div>
                      <h2>{post.title}</h2>
                      <p>{post.content}</p>
                    </div>
                    <footer>
                      {post.authorName} · {formatDate(post.createdAt)}{' '}
                      <span>
                        조회 {post.viewCount} · 댓글 {post.commentCount}
                      </span>
                    </footer>
                  </button>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {authMode && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-label={authMode === 'login' ? '로그인' : '회원가입'}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setAuthMode(null)}
            >
              ×
            </button>
            {authMode === 'login' ? (
              <form onSubmit={submitLogin}>
                <p className="eyebrow">welcome back</p>
                <h2>로그인</h2>
                <input
                  type="email"
                  placeholder="이메일"
                  value={login.email}
                  onChange={(event) =>
                    setLogin({ ...login, email: event.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={login.password}
                  onChange={(event) =>
                    setLogin({ ...login, password: event.target.value })
                  }
                  required
                />
                <button className="primary-button" type="submit">
                  로그인
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setAuthMode('signup')}
                >
                  계정이 없나요? 회원가입
                </button>
              </form>
            ) : (
              <form onSubmit={submitSignUp}>
                <p className="eyebrow">join us</p>
                <h2>회원가입</h2>
                <input
                  type="email"
                  placeholder="이메일"
                  value={signUp.email}
                  onChange={(event) =>
                    setSignUp({ ...signUp, email: event.target.value })
                  }
                  required
                />
                <input
                  placeholder="닉네임"
                  value={signUp.nickname}
                  onChange={(event) =>
                    setSignUp({ ...signUp, nickname: event.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="비밀번호 (8자 이상)"
                  value={signUp.password}
                  onChange={(event) =>
                    setSignUp({ ...signUp, password: event.target.value })
                  }
                  required
                />
                <button className="primary-button" type="submit">
                  회원가입
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setAuthMode('login')}
                >
                  이미 계정이 있나요? 로그인
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

type PostEditorProps = {
  title: string;
  form: PostForm;
  onChange: (form: PostForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  showAuthor?: boolean;
  onCancel: () => void;
};

function PostEditor({
  title,
  form,
  onChange,
  onSubmit,
  submitLabel,
  showAuthor = true,
  onCancel,
}: PostEditorProps) {
  return (
    <form className="post-editor" onSubmit={onSubmit}>
      <p className="eyebrow">board editor</p>
      <h1>{title}</h1>
      <input
        className="title-input"
        placeholder="제목을 입력해주세요."
        value={form.title}
        onChange={(event) => onChange({ ...form, title: event.target.value })}
        required
      />
      {showAuthor && (
        <input
          placeholder="작성자 이름"
          value={form.authorName}
          onChange={(event) =>
            onChange({ ...form, authorName: event.target.value })
          }
          required
        />
      )}
      <textarea
        placeholder="내용을 입력해주세요."
        value={form.content}
        onChange={(event) => onChange({ ...form, content: event.target.value })}
        required
      />
      <div className="editor-actions">
        <button className="text-button" type="button" onClick={onCancel}>
          취소
        </button>
        <button className="primary-button" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function getErrorMessage(value: unknown): string {
  if (isRecord(value) && Array.isArray(value.message))
    return value.message.join(', ');
  if (isRecord(value) && typeof value.message === 'string')
    return value.message;
  return '요청을 처리하지 못했습니다.';
}

function getRequestErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'API 서버에 연결할 수 없습니다. Docker API 서버 상태를 확인해주세요.';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default App;
