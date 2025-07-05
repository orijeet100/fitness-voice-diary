
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Target, Dumbbell, Weight } from 'lucide-react';
import { Workout } from '@/types/workout';

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onDelete }) => {
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
        
        <p className="text-gray-600 mb-3">{workout.description}</p>
        
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{workout.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{workout.exercises.length} exercises</span>
          </div>
        </div>
        
        {/* Muscle Groups */}
        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Muscle Groups:</p>
            <div className="flex flex-wrap gap-2">
              {workout.muscleGroups.map((group, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  {group}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Exercise Details */}
        {workout.exerciseDetails && workout.exerciseDetails.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Exercise Details:</p>
            <div className="space-y-2">
              {workout.exerciseDetails.map((exercise, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-gray-800">{exercise.name}</span>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {exercise.muscleGroup}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {exercise.sets && exercise.reps && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{exercise.sets} × {exercise.reps}</span>
                      </div>
                    )}
                    {exercise.weight && (
                      <div className="flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        <span>{exercise.weight}</span>
                      </div>
                    )}
                  </div>
                  {exercise.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{exercise.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Fallback: Basic exercises list (for backward compatibility) */}
        {(!workout.exerciseDetails || workout.exerciseDetails.length === 0) && workout.exercises.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Exercises:</p>
            <div className="flex flex-wrap gap-2">
              {workout.exercises.map((exercise, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                >
                  {exercise}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
