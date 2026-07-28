import { formatDueDate, getDueState } from '../utils/date'
import { mixHex, getReadableTextColor } from "../utils/color";
import { usePlannerData } from "../hooks/usePlannerData";
import { UndoIcon, CheckIcon, WeekIcon, BacklogIcon, CloseIcon } from './Icons';

export default function TaskCard({
  task,
  onDone,
  onBacklog,
  onMoveToWeek,
  onDelete,
  compact = false,
  hideWeekAction = false,
  hideBacklogAction = false,
  hideDeleteAction = false,
}) {
  const planner = usePlannerData();
  const categories = planner.taskCategories ?? [];
  const category = categories.find((item) => item.label === task.subject);
  const baseColor = category?.baseColor ?? "#ffda96";

  const borderColor = mixHex(baseColor, "#d4d1ca", 0.45);
  const softBg = mixHex(baseColor, "#fbfbf8", 0.9);
  const textColor = getReadableTextColor(baseColor);

  const dueState = getDueState(task.due);
  const isUrgent = dueState === "overdue";
  
  return (
    <article className={`task-card ${SUBJECT_COLORS[task.subject] ?? 'subject-other'} ${task.status === 'done' ? 'is-done' : ''}
    ${compact ? 'compact' : ''} ${dueState ? `due-${dueState}` : ''}`}
    style={{ background: softBg, borderColor, color: textColor }}>

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