import { useState } from 'react';
import { Heart, Reply, User, Send } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import Empty from './Empty';
import type { Comment } from '@/types';

interface CommentSectionProps {
  storyId: string;
}

interface ReplyingTo {
  commentId: string;
  userId: string;
  username: string;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
}

export default function CommentSection({ storyId }: CommentSectionProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const users = useAppStore((s) => s.users);
  const addComment = useAppStore((s) => s.addComment);
  const toggleCommentLike = useAppStore((s) => s.toggleCommentLike);
  const getCommentsByStoryId = useAppStore((s) => s.getCommentsByStoryId);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const allComments = getCommentsByStoryId(storyId);
  const rootComments = allComments.filter((c) => !c.parentId);

  const getUserById = (userId: string) => users.find((u) => u.id === userId);

  const handleSubmitComment = () => {
    if (!currentUser || !newComment.trim()) return;
    addComment({
      storyId,
      userId: currentUser.id,
      content: newComment.trim(),
    });
    setNewComment('');
  };

  const handleSubmitReply = () => {
    if (!currentUser || !replyingTo || !replyContent.trim()) return;
    addComment({
      storyId,
      userId: currentUser.id,
      parentId: replyingTo.commentId,
      replyToUserId: replyingTo.userId,
      content: replyContent.trim(),
    });
    setReplyContent('');
    setReplyingTo(null);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const handleStartReply = (comment: Comment) => {
    const user = getUserById(comment.userId);
    if (!currentUser) return;
    setReplyingTo({
      commentId: comment.id,
      userId: comment.userId,
      username: user?.username || '未知用户',
    });
    setReplyContent('');
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const user = getUserById(comment.userId);
    const replyToUser = comment.replyToUserId ? getUserById(comment.replyToUserId) : null;
    const replies = allComments.filter((c) => c.parentId === comment.id);

    return (
      <div
        key={comment.id}
        className={cn(
          'space-y-3',
          isReply ? 'pl-6 border-l-2 border-rice-200' : ''
        )}
      >
        <div className="flex gap-3">
          <div className="shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className={cn(
                  'rounded-full border border-rice-300 object-cover',
                  isReply ? 'w-8 h-8' : 'w-10 h-10'
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center rounded-full bg-rice-200 text-ink-400',
                  isReply ? 'w-8 h-8' : 'w-10 h-10'
                )}
              >
                <User size={isReply ? 16 : 20} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    'font-medium text-ink-800',
                    isReply ? 'text-sm' : ''
                  )}>
                    {user?.username || '未知用户'}
                  </span>
                  {replyToUser && (
                    <>
                      <span className="text-ink-400 text-xs">回复</span>
                      <span className="text-cinnabar-600 font-medium text-sm">
                        {replyToUser.username}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-ink-500 mt-0.5">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            </div>

            <p className={cn(
              'text-ink-700 leading-relaxed mt-2',
              isReply ? 'text-sm' : ''
            )}>
              {comment.content}
            </p>

            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => toggleCommentLike(comment.id)}
                className="inline-flex items-center gap-1.5 text-ink-500 hover:text-cinnabar-600 transition-colors text-xs"
              >
                <Heart size={14} className={comment.likeCount > 0 ? 'fill-cinnabar-500 text-cinnabar-500' : ''} />
                <span>{comment.likeCount > 0 ? comment.likeCount : '点赞'}</span>
              </button>

              {currentUser && !isReply && (
                <button
                  onClick={() => handleStartReply(comment)}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-ink-500 hover:text-cinnabar-600 transition-colors text-xs',
                    replyingTo?.commentId === comment.id && 'text-cinnabar-600'
                  )}
                >
                  <Reply size={14} />
                  <span>回复</span>
                </button>
              )}
            </div>

            {replyingTo?.commentId === comment.id && (
              <div className="mt-4 p-4 rounded-xl bg-rice-50 border border-rice-200">
                <p className="text-xs text-ink-500 mb-2">
                  回复 <span className="text-cinnabar-600 font-medium">@{replyingTo.username}</span>
                </p>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="写下你的回复..."
                  rows={2}
                  className="input-base resize-none text-sm"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={handleCancelReply}
                    className="btn-ghost text-xs py-2 px-4"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim()}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    <Send size={14} />
                    发送回复
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {replies.length > 0 && (
          <div className="space-y-4 mt-4">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="card p-6">
      <div className="mb-6">
        <h2 className="section-title flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-cinnabar-500 to-gold-500 rounded-full" />
          用户评论
          <span className="text-lg text-ink-500 font-sans font-normal">
            ({allComments.length})
          </span>
        </h2>
      </div>

      {currentUser ? (
        <div className="mb-8">
          <div className="flex gap-3">
            <div className="shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-10 h-10 rounded-full border border-rice-300 object-cover"
                />
              ) : (
                <div className="flex w-10 h-10 items-center justify-center rounded-full bg-rice-200 text-ink-400">
                  <User size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="分享你的看法..."
                rows={3}
                className="input-base resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-500">
                  以 <span className="text-cinnabar-600 font-medium">{currentUser.username}</span> 的身份发表
                </p>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="btn-primary py-2.5 px-5 text-sm"
                >
                  <Send size={16} />
                  发表评论
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-rice-50 border border-rice-200 text-center">
          <p className="text-ink-500 text-sm">
            请先登录后再发表评论
          </p>
        </div>
      )}

      {rootComments.length === 0 ? (
        <div className="py-12">
          <Empty />
        </div>
      ) : (
        <div className="space-y-6">
          {rootComments.map((comment) => renderComment(comment))}
        </div>
      )}
    </section>
  );
}
