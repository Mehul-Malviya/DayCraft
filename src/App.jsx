
import { useState, useEffect } from "react";
import "./App.css";

function getGreeting() {
  const hour = new Date().getHours();

  if(hour<12) {
    return "GOOD MORNING ";
  }
  
  if (hour < 17) {
    return "GOOD AFTERNOON";
  }

  return "GOOD EVENING";
}

function App() {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("userName") || "";
  });

  const [nameInput, setNameInput] = useState("");

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
      return JSON.parse(savedTasks);
    }

    return [
      { id: 1, title: "Learn React", completed: false, priority: "high" },
      { id: 2, title: "Build dashboard", completed: false, priority: "medium" },
      { id: 3, title: "Practice JavaScript", completed: true, priority: "low" },
    ];
  });

  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem("habits");

    if (savedHabits) {
      return JSON.parse(savedHabits);
    }

    return [
      { id: 1, title: "Read for 20 minutes", completed: false },
      { id: 2, title: "Exercise", completed: false },
      { id: 3, title: "Study for 1 hour", completed: false },
    ];
  });

  const [newTask, setNewTask] = useState("");
  const [newHabit, setNewHabit] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [taskFilter, setTaskFilter] = useState("all");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");

  const completedTasks = tasks.filter((task) => task.completed);
  const remainingTasks = tasks.filter((task) => !task.completed);
  const completedHabits = habits.filter((habit) => habit.completed);

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks.length / tasks.length) * 100);

  let filteredTasks = tasks;

  if (taskFilter === "active") {
    filteredTasks = tasks.filter((task) => !task.completed);
  }

  if (taskFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  }

  let habitProgress;

  if (habits.length === 0) {
    habitProgress = 0;
  } else {
    habitProgress = Math.round(
      (completedHabits.length / habits.length) * 100
    );
  }

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          setIsRunning(false);
          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  function saveUserName(event) {
    event.preventDefault();

    const trimmedName = nameInput.trim();

    if(trimmedName === "") {
      return;
    }

    localStorage.setItem("userName", trimmedName);
    setUserName(trimmedName);
    setNameInput("");
  }

  function toggleTask(taskId) {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }

      return task;
    });

    setTasks(updatedTasks);
  }
  
  function toggleHabit(habitId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;

    setHabits((previousHabits) => {
      return previousHabits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        const completedDates = habit.completedDates || [];
        let updatedDates = [...completedDates];

        if (habit.completed) {
          updatedDates = updatedDates.filter((date) => {
            return date !== todayString;
          });
        } else {
          if (!updatedDates.includes(todayString)) {
            updatedDates.push(todayString);
          }
        }

        return {
          ...habit,
          completed: !habit.completed,
          completedDates: updatedDates,
        };
      });
    });
  }


  function addTask(event) {
    event.preventDefault();

    if (newTask.trim() === "") {
      return;
    }

    const taskToAdd = {
      id: Date.now(),
      title: newTask,
      completed: false,
      priority: newPriority,
    };

    setTasks([...tasks, taskToAdd]);
    setNewTask("");
    setNewPriority("medium");
  }

  function deleteTask(taskId) {
    const remainingTasks = tasks.filter((task) => task.id !== taskId);

    setTasks(remainingTasks);
  }

  function saveEdit() {
    if (editText.trim() === "") {
      return;
    }

    const updatedTasks = tasks.map((task) => {
      if (task.id === editingTaskId) {
        return { ...task, title: editText };
      }

      return task;
    });

    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditText("");
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditText("");
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setEditText(task.title);
  }

  function startTimer() {
    if (timeLeft === 0) {
      setTimeLeft(focusMinutes * 60);
    }

    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(focusMinutes * 60);
  }

  let timerMessage;

  if (timeLeft === 0) {
    timerMessage = "Session complete!";
  } else if (isRunning) {
    timerMessage = "Stay focused.";
  } else {
    timerMessage = "Ready to focus?";
  }

  function changeDuration(minutes) {
    setFocusMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  }

  function addHabit(event) {
    event.preventDefault();

    if(newHabit.trim() === "") {
      return;
    }

    const habitToAdd = {
      id: Date.now(),
      title: newHabit,
      completed: false,
    };

    setHabits([...habits, habitToAdd]);
    setNewHabit("");
  }

  function deleteHabit(habitId) {
    const remainingHabits = habits.filter((habit) => {
      return habit.id !== habitId;
    });

    setHabits(remainingHabits);
  }

  if (!userName) {
    return (
      <main className="welcome-screen">
        <section className="welcome-card">
          <p className="welcome-eyebrow">A FRESH START, EVERY DAY</p>

          <h1>Welcome to your little corner.</h1>

          <p className="welcome-description">
            A little space to plan, focus, and make today count.
          </p>

          <form onSubmit={saveUserName} className="welcome-form">
            <label htmlFor="user-name">What should we call you?</label>

            <input
              id="user-name"
              type="text"
              placeholder="Enter your name..."
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              autoFocus
            />

            <button type="submit">Let's get started →</button>
          </form>
        </section>
      </main>
    );
  }
  return(
    <main className="dashboard">
      <h1>{getGreeting()}, {userName}!!!</h1>
      <p>Let's make today productive</p>

      <section className="card">
        <h2>
          Tasks ({completedTasks.length}/{tasks.length})
        </h2>

        <p className="task-summary">
          {remainingTasks.length} tasks remaining
        </p>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Add a task..."
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
          />

          <select
            className="priority-select"
            value={newPriority}
            onChange={(event) => setNewPriority(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button type="submit">Add</button>
        </form>

        <div className="task-filters">
          <button
            className={
              taskFilter === "all"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setTaskFilter("all")}
          >
            All
          </button>

          <button
            className={
              taskFilter === "completed"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setTaskFilter("completed")}
          >
            Completed
          </button>
        </div>

        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />

              {editingTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(event) => setEditText(event.target.value)}
                  />

                  <button
                    className="save-button"
                    onClick={saveEdit}
                  >
                    Save
                  </button>

                  <button
                    className="cancel-button"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className={task.completed ? "completed" : ""}>
                    {task.title}
                  </span>

                  <button
                    className="edit-button"
                    onClick={() => startEditing(task)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-task"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card progress-card">
        <h2>Today's progress</h2>

        <p className="progress-count">
          {completedTasks.length}/{tasks.length} tasks completed
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="progress-percentage">{progress}%</p>
      </section>

      <section className="card focus-card">
        <h2>Focus Timer</h2>

        <p className="focus-description">
          Choose how long you want to focus.
        </p>

        <div className="duration-setting">
          <label htmlFor="focus-duration">
            Focus duration (minutes)
          </label>

          <input
            id="focus-duration"
            type="number"
            min="1"
            max="180"
            value={focusMinutes}
            onChange={(event) => {
              const value = Number(event.target.value);

              if (value >= 1 && value <= 180) {
                changeDuration(value);
              }
            }}
          />
        </div>

        <div className="timer-presets">
          <button onClick={() => changeDuration(15)}>
            15 Min
          </button>

          <button onClick={() => changeDuration(30)}>
            30 Min
          </button>

          <button onClick={() => changeDuration(45)}>
            45 Min
          </button>

          <button onClick={() => changeDuration(60)}>
            60 Min
          </button>
        </div>

        <div className="timer-display">
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>

        <div className="timer-controls">
          <button onClick={startTimer} disabled={isRunning}>
            START
          </button>

          <button onClick={pauseTimer} disabled={!isRunning}>
            PAUSE
          </button>

          <button onClick={resetTimer}>
            RESET
          </button>
        </div>

        <p className="timer-label">{timerMessage}</p>
      </section>

      <section className="card habits-card">
        <h2>Daily Habits</h2>

        <p className="habits-description">
          Small actions, repeated daily.
        </p>

        <form className="habit-form" onSubmit={addHabit}>
          <input type="text"
          placeholder="Add a new habit ..."
          value={newHabit}
          onChange={(event)=>setNewHabit(event.target.value)}
          />
          <button type="submit">Add Habit</button>
        </form>

        <p className="habits-progress">
          {completedHabits.length} of {habits.length} habits completed (
          {habitProgress}%)
        </p>

        <div className="habits-progress-bar">
          <div
            className="habits-progress-fill"
            style={{width: `${habitProgress}%`}}
          >
          </div>
        </div>

        <ul className="habits-list">
          {habits.map((habit) => (
            <li key={habit.id}>
              <label className="habit-item">
                <input
                  type="checkbox"
                  checked={habit.completed}
                  onChange={() => toggleHabit(habit.id)}
                />

                <span
                  className={
                    habit.completed ? "habit-completed" : ""
                  }
                >
                  {habit.title}
                </span>
              </label>
              <button
                className="delete-habit"
                onClick={() => deleteHabit(habit.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
