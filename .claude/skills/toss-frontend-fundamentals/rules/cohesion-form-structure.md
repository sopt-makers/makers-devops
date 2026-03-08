# 폼의 응집도 생각하기

## 요약

폼 상태, 유효성 검사, 제출 로직은 함께 수정될 가능성이 높다. 이들을 한 곳에 모아 응집도를 높인다.

## 문제 상황

폼 관련 로직이 여러 곳에 흩어져 있으면, 필드 추가나 유효성 규칙 변경 시 수정할 곳을 찾기 어렵다.

## 나쁜 예시

```tsx
// hooks/useSignupValidation.ts
export function useSignupValidation() {
  return {
    validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    validatePassword: (pw) => pw.length >= 8,
  };
}

// components/SignupForm.tsx
function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { validateEmail, validatePassword } = useSignupValidation();

  const handleSubmit = async () => {
    const newErrors = {};
    if (!validateEmail(email)) newErrors.email = '유효하지 않은 이메일';
    if (!validatePassword(password)) newErrors.password = '8자 이상';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    await api.signup({ email, password });
  };
  // ...
}
```

**문제점**: 유효성 검사 로직과 에러 메시지가 분리되어 있다.

## 좋은 예시

```tsx
// features/signup/useSignupForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('유효하지 않은 이메일'),
  password: z.string().min(8, '8자 이상 입력해주세요'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function useSignupForm() {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    await api.signup(data);
  };

  return { form, onSubmit };
}

// features/signup/SignupForm.tsx
function SignupForm() {
  const { form, onSubmit } = useSignupForm();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email?.message}
      {/* ... */}
    </form>
  );
}
```

**개선점**: 스키마, 유효성 검사, 에러 메시지가 한 곳에 모여 있다.

## 폼 응집도 체크리스트

- [ ] 필드 정의와 유효성 규칙이 한 곳에 있는가?
- [ ] 에러 메시지가 유효성 규칙과 함께 정의되어 있는가?
- [ ] 폼 상태 관리가 하나의 Hook/컴포넌트에 캡슐화되어 있는가?
- [ ] 새 필드 추가 시 한 곳만 수정하면 되는가?

## 핵심 포인트

- 폼 스키마로 필드와 유효성을 함께 정의
- react-hook-form, zod 등 라이브러리 활용
- 폼 로직을 커스텀 Hook으로 캡슐화
- 컴포넌트는 UI 렌더링에만 집중

## 참고

- [Toss Frontend Fundamentals - 폼의 응집도 생각하기](https://frontend-fundamentals.com/code-quality/en/code/examples/form-fields)
