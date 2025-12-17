import { supabase } from "../lib/supabase";
import { ExerciseType, Work } from "../types";

// ============================================
// TYPES
// ============================================

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
  avatar_url: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  join_code: string;
  created_at: string;
  member_count?: number;
}

export interface ClassMember {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
  student?: Profile;
}

export interface Assignment {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  exercise_type: ExerciseType;
  work_title: string | null;
  work_author: string | null;
  work_parcours: string | null;
  due_date: string | null;
  created_at: string;
}

export interface StudentProgress {
  student: Profile;
  exercises_count: number;
  average_score: number | null;
  last_activity: string | null;
}

// ============================================
// PROFILE
// ============================================

export async function getProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile(
  updates: Partial<Profile>,
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }

  return data;
}

// ============================================
// CLASSES (Teacher)
// ============================================

export async function createClass(
  name: string,
  description?: string,
): Promise<Class | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Generate unique join code
  const { data: codeData } = await supabase.rpc("generate_join_code");
  const joinCode =
    codeData || Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from("classes")
    .insert({
      teacher_id: user.id,
      name,
      description,
      join_code: joinCode,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating class:", error);
    return null;
  }

  return data;
}

export async function getTeacherClasses(): Promise<Class[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("classes")
    .select(
      `
      *,
      class_members(count)
    `,
    )
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }

  return (data || []).map((c) => ({
    ...c,
    member_count: c.class_members?.[0]?.count || 0,
  }));
}

export async function getClassMembers(classId: string): Promise<ClassMember[]> {
  const { data, error } = await supabase
    .from("class_members")
    .select(
      `
      *,
      student:profiles(*)
    `,
    )
    .eq("class_id", classId)
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("Error fetching class members:", error);
    return [];
  }

  return data || [];
}

export async function removeStudentFromClass(
  classId: string,
  studentId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("class_members")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) {
    console.error("Error removing student:", error);
    return false;
  }

  return true;
}

export async function deleteClass(classId: string): Promise<boolean> {
  const { error } = await supabase.from("classes").delete().eq("id", classId);

  if (error) {
    console.error("Error deleting class:", error);
    return false;
  }

  return true;
}

// ============================================
// CLASSES (Student)
// ============================================

export async function joinClass(
  joinCode: string,
): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  // Find class by join code
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("id")
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (classError || !classData) {
    return { success: false, error: "Code de classe invalide" };
  }

  // Join the class
  const { error: joinError } = await supabase.from("class_members").insert({
    class_id: classData.id,
    student_id: user.id,
  });

  if (joinError) {
    if (joinError.code === "23505") {
      return { success: false, error: "Vous êtes déjà membre de cette classe" };
    }
    return { success: false, error: "Erreur lors de l'inscription" };
  }

  return { success: true };
}

export async function getStudentClasses(): Promise<Class[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("class_members")
    .select(
      `
      class:classes(*)
    `,
    )
    .eq("student_id", user.id);

  if (error) {
    console.error("Error fetching student classes:", error);
    return [];
  }

  return (data || [])
    .map((m) => (m as unknown as { class: Class | null }).class)
    .filter((c): c is Class => c !== null);
}

export async function leaveClass(classId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("class_members")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", user.id);

  if (error) {
    console.error("Error leaving class:", error);
    return false;
  }

  return true;
}

// ============================================
// ASSIGNMENTS
// ============================================

export async function createAssignment(params: {
  classId: string;
  title: string;
  description?: string;
  exerciseType: ExerciseType;
  work?: Work;
  dueDate?: Date;
}): Promise<Assignment | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      class_id: params.classId,
      teacher_id: user.id,
      title: params.title,
      description: params.description,
      exercise_type: params.exerciseType,
      work_title: params.work?.title,
      work_author: params.work?.author,
      work_parcours: params.work?.parcours,
      due_date: params.dueDate?.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating assignment:", error);
    return null;
  }

  return data;
}

export async function getClassAssignments(
  classId: string,
): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }

  return data || [];
}

export async function getStudentAssignments(): Promise<Assignment[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // First, get the class IDs the student is a member of
  const { data: membershipData, error: membershipError } = await supabase
    .from("class_members")
    .select("class_id")
    .eq("student_id", user.id);

  if (membershipError || !membershipData) {
    console.error("Error fetching class memberships:", membershipError);
    return [];
  }

  const classIds = membershipData.map((m) => m.class_id);
  if (classIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("assignments")
    .select(
      `
      *,
      class:classes(name)
    `,
    )
    .in("class_id", classIds)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching student assignments:", error);
    return [];
  }

  return data || [];
}

export async function deleteAssignment(assignmentId: string): Promise<boolean> {
  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    console.error("Error deleting assignment:", error);
    return false;
  }

  return true;
}

// ============================================
// STUDENT PROGRESS (for teachers)
// ============================================

export async function getClassStudentsProgress(
  classId: string,
): Promise<StudentProgress[]> {
  const members = await getClassMembers(classId);

  const progressPromises = members.map(async (member) => {
    if (!member.student) return null;

    const { data: exercises } = await supabase
      .from("exercises")
      .select("score, created_at")
      .eq("user_id", member.student_id)
      .order("created_at", { ascending: false });

    const scores = (exercises || [])
      .filter((e) => e.score !== null)
      .map((e) => e.score as number);
    const averageScore =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;

    return {
      student: member.student,
      exercises_count: exercises?.length || 0,
      average_score: averageScore,
      last_activity: exercises?.[0]?.created_at || null,
    };
  });

  const results = await Promise.all(progressPromises);
  return results.filter(Boolean) as StudentProgress[];
}
