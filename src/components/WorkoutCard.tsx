
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Target, Mic } from 'lucide-react';

interface Workout {
  id: string;
  date: string;
  title: string;
  description: string;
  duration: string;
  exercises: string[];
  voiceTranscript?: string;
  timestamp: number;
}

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
        
        {workout.exercises.length > 0 && (
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
        
        {workout.voiceTranscript && (
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Voice Note:</span>
            </div>
            <p className="text-sm text-blue-800">{workout.voiceTranscript}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
