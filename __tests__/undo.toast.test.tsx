import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TasksProvider, useTasks } from '../src/lib/hooks';
import { ToastProvider, useToast } from '../src/lib/toast';

function UndoHarness() {
  const { tasks, addTasks, setStatus, updateTask } = useTasks();
  const { showToast } = useToast();
  const [ready, setReady] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void addTasks([
      { title: 'Task A', notes: '', priority: 1, estimateMinutes: 30 },
      { title: 'Task B', notes: '', priority: 2, estimateMinutes: 30 },
      { title: 'Task C', notes: '', priority: 3, estimateMinutes: 30 },
    ]);
  }, [addTasks]);

  useEffect(() => {
    if (tasks.length >= 3) {
      setReady(true);
    }
  }, [tasks]);

  const taskA = tasks.find((task) => task.title === 'Task A');
  const taskB = tasks.find((task) => task.title === 'Task B');
  const taskC = tasks.find((task) => task.title === 'Task C');

  return (
    <View>
      <Text testID="ready">{ready ? 'ready' : 'loading'}</Text>
      <Text testID="status-a">{taskA?.status ?? ''}</Text>
      <Text testID="status-b">{taskB?.status ?? ''}</Text>
      <Text testID="status-c">{taskC?.status ?? ''}</Text>
      <Pressable
        testID="mark-done-a"
        onPress={() => {
          if (!taskA) return;
          const snapshot = {
            id: taskA.id,
            prevStatus: taskA.status,
            prevCompletedAt: taskA.completedAt,
            prevCompletedFrom: taskA.completedFrom,
          };
          const baseTask = { ...taskA };
          setStatus(taskA.id, 'done');
          showToast({
            message: 'Marked done',
            actionLabel: 'Undo',
            onAction: () => {
              updateTask({
                ...baseTask,
                status: snapshot.prevStatus,
                completedAt: snapshot.prevCompletedAt,
                completedFrom: snapshot.prevCompletedFrom,
              });
            },
          });
        }}
      >
        <Text>Mark A Done</Text>
      </Pressable>
      <Pressable
        testID="move-b-today"
        onPress={() => {
          if (!taskB) return;
          setStatus(taskB.id, 'today');
        }}
      >
        <Text>Move B Today</Text>
      </Pressable>
    </View>
  );
}

describe('toast undo', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('undo restores only the task that was marked done', async () => {
    const { getByTestId, findByText } = render(
      <SafeAreaProvider>
        <TasksProvider>
          <ToastProvider>
            <UndoHarness />
          </ToastProvider>
        </TasksProvider>
      </SafeAreaProvider>
    );

    await waitFor(() => expect(getByTestId('ready')).toHaveTextContent('ready'));

    fireEvent.press(getByTestId('mark-done-a'));
    fireEvent.press(getByTestId('move-b-today'));

    fireEvent.press(await findByText('Undo'));

    await waitFor(() => {
      expect(getByTestId('status-a')).toHaveTextContent('inbox');
      expect(getByTestId('status-b')).toHaveTextContent('today');
      expect(getByTestId('status-c')).toHaveTextContent('inbox');
    });
  });
});
