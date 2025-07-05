
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Dumbbell, Weight } from 'lucide-react';
import { Workout } from '@/types/workout';

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onDelete }) => {
  // Group sets by exercise name
  const groupedExercises = workout.exerciseSets.reduce((acc, set) => {
    if (!acc[set.exerciseName]) {
      acc[set.exerciseName] = [];
    }
    acc[set.exerciseName].push(set);
    return acc;
  }, {} as Record<string, typeof workout.exerciseSets>);

  return (
    <Card className="bg-gradient-to-r from-white to-purple-50 border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-800 text-lg">{workout.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(workout.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(groupedExercises).map(([exerciseName, sets]) => (
            <div key={exerciseName} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-800">{exerciseName}</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-auto">
                  {sets[0].muscleGroup}
                </span>
              </div>
              
              <div className="space-y-1">
                {sets.map((set, index) => (
                  <div key={set.id} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                    <span className="font-medium">Set {index + 1}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        <span>{set.weight}</span>
                      </div>
                      <span>{set.reps} reps</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-purple-100">
          <p className="text-sm text-gray-500">
            {workout.exerciseSets.length} total sets • {Object.keys(groupedExercises).length} exercises
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
