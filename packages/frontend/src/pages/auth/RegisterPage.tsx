import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, Check, Users } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
} from '@/components/ui';
import { useRegisterMutation } from '@/store/api/authApi';

const AVAILABLE_ROLES = [
  { value: 'contributor', label: 'Contributor', description: 'Can create content but not publish' },
  { value: 'author', label: 'Author', description: 'Can create and manage own content' },
  { value: 'editor', label: 'Editor', description: 'Can edit and publish any content' },
  { value: 'admin', label: 'Admin', description: 'Administrative access to manage content and users' },
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access with all permissions' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to content' },
] as const;

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    role: z.string().min(1, 'Please select a role'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordRequirements = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'contributor',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password', '');
  const selectedRole = watch('role', 'contributor');

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      }).unwrap();

      if (response.success) {
        setSuccess(true);
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Registration successful! Please sign in.' },
          });
        }, 2000);
      } else {
        setError(response.error?.message || 'Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const apiError = err as { data?: { error?: { message?: string } } };
      setError(apiError?.data?.error?.message || 'Registration failed. Please try again.');
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-50">
              Registration Successful!
            </h2>
            <p className="mt-2 text-secondary-600 dark:text-secondary-400">
              Redirecting you to the login page...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Get started with Content Sphere Hub
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Input
            {...register('name')}
            type="text"
            label="Full name"
            placeholder="John Doe"
            error={errors.name?.message}
            leftIcon={<User className="h-4 w-4" />}
            autoComplete="name"
          />

          <Input
            {...register('email')}
            type="email"
            label="Email address"
            placeholder="you@example.com"
            error={errors.email?.message}
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
          />

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Account Type
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Users className="h-4 w-4 text-secondary-400" />
              </div>
              <select
                {...register('role')}
                className="block w-full rounded-lg border border-secondary-300 bg-white py-2.5 pl-10 pr-4 text-sm text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-secondary-600 dark:bg-secondary-800 dark:text-secondary-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
              >
                {AVAILABLE_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.role?.message && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
            {/* Role description */}
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              {AVAILABLE_ROLES.find((r) => r.value === selectedRole)?.description}
            </p>
          </div>

          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            autoComplete="new-password"
          />

          {/* Password requirements indicator */}
          <div className="space-y-1">
            {passwordRequirements.map((req) => {
              const met = req.test(password);
              return (
                <div
                  key={req.key}
                  className={`flex items-center gap-2 text-xs ${
                    met
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-secondary-400 dark:text-secondary-500'
                  }`}
                >
                  {met ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  {req.label}
                </div>
              );
            })}
          </div>

          <Input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create account
          </Button>

          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default RegisterPage;
