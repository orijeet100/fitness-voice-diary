
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Square, Play, Save, X, Plus, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Workout, ExerciseSet, LLMResponse } from '@/types/workout';

interface VoiceRecorderProps {
  selectedDate: Date;
  onSave: (workout: Omit<Workout, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ selectedDate, onSave, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [title, setTitle] = useState('');
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
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

  const createEmptySet = (): ExerciseSet => ({
    id: crypto.randomUUID(),
    exerciseName: '',
    muscleGroup: '',
    weight: '',
    reps: 0
  });

  const addNewSet = () => {
    setExerciseSets(prev => [...prev, createEmptySet()]);
  };

  const updateSet = (id: string, field: keyof ExerciseSet, value: string | number) => {
    setExerciseSets(prev => prev.map(set => 
      set.id === id ? { ...set, [field]: value } : set
    ));
  };

  const deleteSet = (id: string) => {
    setExerciseSets(prev => prev.filter(set => set.id !== id));
  };

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
      setErrorMessage('');
      
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Describe your exercise sets clearly.",
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
        description: "Processing your voice input...",
      });
      simulateLLMProcessing();
    }
  };

  const simulateLLMProcessing = () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    setTimeout(() => {
      // Mock LLM response - this would be replaced with actual LLM API call
      const mockResponse: LLMResponse = Math.random() > 0.2 ? {
        success: true,
        sets: [
          {
            id: crypto.randomUUID(),
            exerciseName: "Bench Press",
            muscleGroup: "Chest",
            weight: "185 lbs",
            reps: 8
          },
          {
            id: crypto.randomUUID(),
            exerciseName: "Bench Press",
            muscleGroup: "Chest",
            weight: "185 lbs",
            reps: 6
          },
          {
            id: crypto.randomUUID(),
            exerciseName: "Shoulder Press",
            muscleGroup: "Shoulders",
            weight: "65 lbs",
            reps: 10
          }
        ]
      } : {
        success: false,
        error: "Could not understand the workout details. Please try again with clearer instructions."
      };

      if (mockResponse.success && mockResponse.sets) {
        setExerciseSets(mockResponse.sets);
        setTitle("Voice Workout Session");
        toast({
          title: "AI Analysis Complete!",
          description: `Extracted ${mockResponse.sets.length} exercise sets.`,
        });
      } else {
        setErrorMessage(mockResponse.error || "Enter Valid query");
        toast({
          title: "Processing Error",
          description: mockResponse.error || "Enter Valid query",
          variant: "destructive",
        });
      }
      
      setIsProcessing(false);
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

    if (exerciseSets.length === 0) {
      toast({
        title: "No Exercise Sets",
        description: "Please add at least one exercise set.",
        variant: "destructive",
      });
      return;
    }

    const validSets = exerciseSets.filter(set => 
      set.exerciseName.trim() && set.muscleGroup.trim() && set.weight.trim() && set.reps > 0
    );

    if (validSets.length === 0) {
      toast({
        title: "Invalid Sets",
        description: "Please fill in all required fields for at least one set.",
        variant: "destructive",
      });
      return;
    }

    const workout = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      title: title.trim(),
      exerciseSets: validSets,
    };

    onSave(workout);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize with one empty set if none exist
  useEffect(() => {
    if (exerciseSets.length === 0) {
      addNewSet();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
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
        
        <CardContent className="p-6 space-y-6">
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

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <Label htmlFor="title">Workout Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Upper Body Session"
              className="mt-1"
            />
          </div>

          {/* Exercise Sets */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Exercise Sets</Label>
              <Button
                onClick={addNewSet}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Set
              </Button>
            </div>

            {exerciseSets.map((set, index) => (
              <Card key={set.id} className="p-4 bg-gray-50 border-l-4 border-purple-400">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-800">Set {index + 1}</h4>
                  {exerciseSets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSet(set.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor={`exercise-${set.id}`}>Exercise Name *</Label>
                    <Input
                      id={`exercise-${set.id}`}
                      value={set.exerciseName}
                      onChange={(e) => updateSet(set.id, 'exerciseName', e.target.value)}
                      placeholder="e.g., Bench Press"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`muscle-${set.id}`}>Muscle Group *</Label>
                    <Input
                      id={`muscle-${set.id}`}
                      value={set.muscleGroup}
                      onChange={(e) => updateSet(set.id, 'muscleGroup', e.target.value)}
                      placeholder="e.g., Chest"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`weight-${set.id}`}>Weight *</Label>
                      <Input
                        id={`weight-${set.id}`}
                        value={set.weight}
                        onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                        placeholder="e.g., 185 lbs"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`reps-${set.id}`}>Reps *</Label>
                      <Input
                        id={`reps-${set.id}`}
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(set.id, 'reps', parseInt(e.target.value) || 0)}
                        placeholder="8"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
