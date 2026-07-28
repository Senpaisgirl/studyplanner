import { formatDueDate, getDueState } from '../utils/date'
import { SUBJECT_COLORS } from '../data/subjectColors';
import { UndoIcon, CheckIcon, WeekIcon, BacklogIcon, CloseIcon } from './Icons';

export default function TaskCard({
  task,
  onDone,
  onBacklog,
  onMoveToWeek,
  compact = false,
  hideWeekAction = false,
  hideBacklogAction = false,
  hideDeleteAction = false,
}) {
  const dueState = getDueState(task.due);
  const isUrgent = dueState === 'overdue'
  
  return (
    <article className={`task-card ${SUBJECT_COLORS[task.subject] ?? 'subject-other'} ${task.status === 'done' ? 'is-done' : ''}
    ${compact ? 'compact' : ''} ${dueState ? `due-${dueState}` : ''}`}>

      <div className="task-top">
        <span className="task-subject">{task.subject}</span>
        <div className="task-actions task-actions-top">
          <button
            type="button"
            onClick={() => onDone(task.id)}
            aria-label={task.status === 'done' ? 'Re-open' : 'Done'}
            title={task.status === 'done' ? 'Re-open' : 'Done'}
          >
            {task.status === 'done' ? <UndoIcon /> : <CheckIcon />}
          </button>

          {!hideWeekAction && (
            task.bucket === 'backlog' ? (
              <button
                type="button"
                onClick={() => onMoveToWeek(task.id)}
                aria-label="This week"
                title="This week"
              >
                <WeekIcon />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onBacklog(task.id)}
                aria-label="Into Backlog"
                title="Into Backlog"
              >
                <BacklogIcon />
              </button>
            )
          )}

          {!hideDeleteAction && (
            <button
              type="button"
              onClick={() => onDelete?.(task.id)}
              aria-label="Delete task"
              title="Delete task"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      <h3 className="task-title">
        <span className='task-title-text'>{task.title}</span>
      </h3>

       {task.due && (
          <p className={`task-due ${dueState === 'soon' ? 'task-due-soon' : ''}`}>
            {isUrgent && <span aria-hidden="true" className="task-alert">❗ </span>}
            Due: {formatDueDate(task.due)}
          </p>
       )}
    </article>
  )
}