"use client";

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Plus, Trash2 } from 'lucide-react';
import { weekDays, mockStore } from '@/lib/mock-data';
import { Logo } from '@/components/layout/logo';

const timeRangeSchema = z.object({
  start: z.string().nonempty(),
  end: z.string().nonempty(),
}).refine(data => data.start < data.end, {
  message: '종료 시간은 시작 시간보다 늦어야 합니다.',
  path: ['end'],
});

const availabilityDaySchema = z.object({
  day: z.string(),
  times: z.array(timeRangeSchema),
});

const availabilitySchema = z.object({
  availability: z.array(availabilityDaySchema),
}).refine(data => data.availability.some(day => day.times.length > 0), {
    message: '최소 한 개 이상의 시간 구간을 제출해야 합니다.',
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

function AvailabilityForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();

    const { control, handleSubmit, formState: { errors, isValid } } = useForm<AvailabilityFormData>({
        resolver: zodResolver(availabilitySchema),
        defaultValues: {
            availability: weekDays.map(day => ({ day, times: [] })),
        },
        mode: 'onChange',
    });

    const { fields } = useFieldArray({ control, name: 'availability' });

    const onSubmit = (data: AvailabilityFormData) => {
        console.log(JSON.stringify(data.availability.filter(d => d.times.length > 0), null, 2));
        toast({ title: "제출 중...", description: "잠시만 기다려주세요." });
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1500);
    };

    if (isSubmitted) {
        return (
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                    <CardTitle className="text-2xl font-headline">제출되었습니다!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">소중한 시간을 내주셔서 감사합니다.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">{mockStore.name}</CardTitle>
                <p className="text-muted-foreground pt-1">3월 2주차 근무 가능 시간을 입력해주세요.</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Accordion type="multiple" className="w-full">
                        {fields.map((field, index) => (
                            <DayAvailabilityField key={field.id} control={control} dayIndex={index} />
                        ))}
                    </Accordion>
                     {errors.availability?.root && <p className="text-sm font-medium text-destructive">{errors.availability.root.message}</p>}
                    <Button type="submit" className="w-full" disabled={!isValid}>제출하기</Button>
                </form>
            </CardContent>
        </Card>
    );
}


function DayAvailabilityField({ control, dayIndex }: { control: any, dayIndex: number }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `availability.${dayIndex}.times`,
    });

    return (
        <AccordionItem value={`day-${dayIndex}`}>
            <AccordionTrigger className="text-lg font-medium">{weekDays[dayIndex]}</AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4">
                    {fields.map((field, timeIndex) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <Controller
                                name={`availability.${dayIndex}.times.${timeIndex}.start`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <div className="flex-1">
                                        <Input type="time" {...field} />
                                        {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                                    </div>
                                )}
                            />
                            <span>~</span>
                             <Controller
                                name={`availability.${dayIndex}.times.${timeIndex}.end`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <div className="flex-1">
                                        <Input type="time" {...field} />
                                        {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                                    </div>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(timeIndex)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={() => append({ start: '', end: '' })}>
                        <Plus className="mr-2 h-4 w-4" /> 시간 추가
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function AvailabilityPage() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Logo />
                </div>
                <AvailabilityForm />
            </div>
        </div>
    );
}
