import { getWeekNumber } from "../utils/date";
import { ChevronLeftIcon, ChevronRightIcon, TodayIcon, SettingsIcon, LogoutIcon } from "./Icons";
import { useState } from "react";
import SettingsModal from "./SettingsModal";


export default function Topbar ({
    weekLabel,
    plannedWeekTasksCount,
    doneWeekTasksCount,
    doneDailyTasksCount,
    weekEventsCount,
    goToPreviousWeek,
    goToCurrentWeek,
    goToNextWeek,
    activeWeekDate,
    onOpenSettings,
    authUser,
    onLogout,
}) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    function Stat({ label, value }) {
        return (
            <article className="stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
            </article>
        )
    }

    return (
        <div className="topbar">
            <div className="topbar-left">
                <div className="topbar-week">
                    <h2>Week {getWeekNumber(activeWeekDate)}</h2>
                    <p className="week-label">{weekLabel}</p>
                </div>

                <div className="week-actions">
                    <button
                    type="button"
                    className="week-nav-btn icon-only"
                    onClick={goToPreviousWeek}
                    aria-label="Last Week"
                    >
                    <ChevronLeftIcon />
                    </button>

                    <button
                    type="button"
                    className="week-nav-btn icon-only"
                    onClick={goToCurrentWeek}
                    aria-label="This Week"
                    >
                    <TodayIcon />
                    </button>

                    <button
                    type="button"
                    className="week-nav-btn icon-only"
                    onClick={goToNextWeek}
                    aria-label="Next Week"
                    >
                    <ChevronRightIcon />
                    </button>
                </div>
            </div>

            <div className="topbar-right stats">
                <Stat label="Planned" value={plannedWeekTasksCount} />
                <Stat label="Done" value={doneWeekTasksCount} />
                <Stat label="Events" value={weekEventsCount} />

                {authUser && (
                    <div className="topbar-account">
                    <span className="topbar-account-email">{authUser.email}</span>
                    <button
                        type="button"
                        className="ghost-btn"
                        onClick={onLogout}
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogoutIcon />
                    </button>
                    </div>
                )}

                <button
                    type="button"
                    className="week-nav-btn icon-only"
                    onClick={onOpenSettings}
                    aria-label="Settings"
                    title="Settings"
                >
                    <SettingsIcon />
                </button>
            </div>
            {settingsOpen && (
                <SettingsModal onClose={() => setSettingsOpen(false)} />
            )}
        </div>
    )
}