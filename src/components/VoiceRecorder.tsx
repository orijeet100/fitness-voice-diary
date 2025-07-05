
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Square, Play, Save, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Workout, ExerciseDetail } from '@/types/workout';

interface VoiceRecorderProps {
  selectedDate: Date;
  onSave: (workout: Omit<Workout, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ selectedDate, onSave, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState('');
  const [muscleGroups, setMuscleGroups] = useState('');
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      const chunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Speak your workout details clearly.",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      toast({
        title: "Recording Stopped",
        description: "Processing your voice note...",
      });
      simulateAIProcessing();
    }
  };

  const simulateAIProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Mock structured workout data extraction
      const mockTranscript = "Did a 45-minute upper body strength session. Started with bench press, 3 sets of 8 reps at 185 pounds. Then shoulder press, 3 sets of 10 reps at 65 pounds. Finished with pull-ups, 3 sets of 6 reps bodyweight, and bicep curls, 3 sets of 12 reps at 25 pounds each arm.";
      
      const mockExerciseDetails: ExerciseDetail[] = [
        {
          name: "Bench Press",
          muscleGroup: "Chest",
          weight: "185 lbs",
          reps: 8,
          sets: 3
        },
        {
          name: "Shoulder Press",
          muscleGroup: "Shoulders",
          weight: "65 lbs",
          reps: 10,
          sets: 3
        },
        {
          name: "Pull-ups",
          muscleGroup: "Back",
          weight: "Bodyweight",
          reps: 6,
          sets: 3
        },
        {
          name: "Bicep Curls",
          muscleGroup: "Arms",
          weight: "25 lbs each",
          reps: 12,
          sets: 3
        }
      ];

      const mockMuscleGroups = ["Chest", "Shoulders", "Back", "Arms"];
      const mockExercises = mockExerciseDetails.map(ex => ex.name);
      
      setVoiceTranscript(mockTranscript);
      setExerciseDetails(mockExerciseDetails);
      setMuscleGroups(mockMuscleGroups.join(", "));
      setExercises(mockExercises.join(", "));
      setTitle("Upper Body Strength Training");
      setDuration("45 minutes");
      setDescription("Complete upper body workout focusing on major muscle groups with compound and isolation exercises.");
      setIsProcessing(false);
      
      toast({
        title: "AI Analysis Complete!",
        description: "Your workout details have been extracted and organized.",
      });
    }, 2000);
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a workout title.",
        variant: "destructive",
      });
      return;
    }

    const workout = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim() || "Not specified",
      exercises: exercises.split(',').map(ex => ex.trim()).filter(ex => ex.length > 0),
      muscleGroups: muscleGroups.split(',').map(mg => mg.trim()).filter(mg => mg.length > 0),
      exerciseDetails: exerciseDetails,
      voiceTranscript: voiceTranscript.trim(),
    };

    onSave(workout);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Add Workout</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-purple-100 text-sm">
            {format(selectedDate, "MMM dd, yyyy")}
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Voice Recording Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-purple-100'}`}>
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="bg-purple-600 hover:bg-purple-700 rounded-full p-4 shadow-lg"
                    disabled={isProcessing}
                  >
                    <Mic className="h-6 w-6 text-white" />
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-lg"
                  >
                    <Square className="h-6 w-6 text-white" />
                  </Button>
                )}
              </div>
            </div>
            
            {isRecording && (
              <div className="text-center">
                <p className="text-red-600 font-semibold">Recording: {formatTime(recordingTime)}</p>
                <p className="text-sm text-gray-500">Describe your exercises, weights, and reps</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <Sparkles className="h-5 w-5 animate-spin" />
                <span>AI is analyzing your workout...</span>
              </div>
            )}
            
            {audioBlob && !isProcessing && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playAudio}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Play Recording
                </Button>
              </div>
            )}
          </div>

          {/* Extracted Exercise Details */}
          {exerciseDetails.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-semibold text-green-800 mb-3">Extracted Workout Details:</h4>
              <div className="space-y-2">
                {exerciseDetails.map((exercise, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-green-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-800">{exercise.name}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {exercise.muscleGroup}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {exercise.sets && <span>{exercise.sets} sets × </span>}
                      {exercise.reps && <span>{exercise.reps} reps</span>}
                      {exercise.weight && <span className="ml-2">@ {exercise.weight}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Input Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Workout Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Upper Body Strength, Cardio Session"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="muscleGroups">Muscle Groups</Label>
              <Input
                id="muscleGroups"
                value={muscleGroups}
                onChange={(e) => setMuscleGroups(e.target.value)}
                placeholder="e.g., Chest, Back, Shoulders"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief workout summary..."
                className="mt-1 min-h-[60px]"
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 45 minutes, 1 hour"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="exercises">Exercises (comma-separated)</Label>
              <Input
                id="exercises"
                value={exercises}
                onChange={(e) => setExercises(e.target.value)}
                placeholder="e.g., Bench Press, Squats, Deadlifts"
                className="mt-1"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isProcessing}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Workout
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceRecorder;
