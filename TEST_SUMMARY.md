# Placement Test Page Summary

## File Location
`/src/app/(dashboard)/dashboard/placement-test/[testType]/page.tsx`

## Purpose
This is a dynamic test interface component that renders different types of placement tests based on the test type parameter in the URL. It serves as the main assessment platform for company placement preparation.

## Key Features

### 1. **Multiple Test Types**
   - **TCS Foundation** (MCQ): 90-minute multiple-choice test covering foundational concepts
   - **TCS Advanced** (MCQ): 45-minute advanced quantitative and logical reasoning test
   - **TCS Coding**: 90-minute coding challenge with 3 problems
   - **Wipro Aptitude** (MCQ): 60-minute aptitude assessment
   - **Wipro Essay**: 30-minute essay writing test
   - **Wipro Coding**: 60-minute coding challenge with 2 problems
   - **Wipro Voice**: 2-minute voice assessment with random prompts

### 2. **Test Components**
   - `PlacementMCQTest`: Multiple-choice question component
   - `CodingEditor`: Code editor for programming challenges
   - `EssayEditor`: Text editor for essay submissions
   - `VoiceRecorder`: Audio recording component for voice assessments

### 3. **Scoring Logic**

   **MCQ Tests**: Count correct answers based on selected options
   
   **Coding Tests**: Score based on number of solved problems
   
   **Essay Tests**: Scoring criteria:
   - 40 points for word count between 200-300
   - 30 points for at least 3 paragraphs
   - 30 points for at least 10 sentences
   
   **Voice Assessment**: Duration-based scoring:
   - 60-120 seconds: 75-95 points
   - 30-60 seconds: 60-80 points
   - Below 30 seconds: 40-60 points

### 4. **Data Submission**
   - All test results are submitted to `/api/results` endpoint
   - Captures answers, solutions, essays, and voice duration
   - Saves company, test type, score, and total points
   - Redirects to results page (`/dashboard/results/{resultId}`) after submission

### 5. **User Interface**
   - Gradient backgrounds for different test types
   - Problem navigation with numbered buttons
   - Visual indicators: current problem (blue), solved (green), unsolved (gray)
   - Loading states during submission
   - Error handling with user alerts
   - Time management (duration displayed in sub-components)

## State Management
- `isSubmitting`: Track submission status
- `currentProblem`: Track active problem in coding tests
- `codingSolutions`: Store submitted code solutions

## API Integration
- **Endpoint**: `POST /api/results`
- **Payload**: Test metadata, answers, solutions, essays, or voice duration
- **Response**: Result ID for viewing detailed results

## Dependencies
- React hooks: `useState`, `useRouter`, `useParams`
- UI Components: Button, Card, CardContent from custom component library
- Icons: Lucide React (Loader2, ChevronLeft, ChevronRight)
- Question banks from `@/lib/question-banks/*`

