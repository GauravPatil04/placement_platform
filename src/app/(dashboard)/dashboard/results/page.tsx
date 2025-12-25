import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock Data
const RESULTS = [
  { id: 1, test: "Time & Work", score: 80, accuracy: 85, date: "2023-11-20" },
  { id: 2, test: "TCS NQT Mock", score: 72, accuracy: 78, date: "2023-11-18" },
  { id: 3, test: "Percentage", score: 90, accuracy: 95, date: "2023-11-15" },
];

export default function ResultsHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Results</h1>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RESULTS.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.test}</TableCell>
                  <TableCell>{result.date}</TableCell>
                  <TableCell>{result.score}%</TableCell>
                  <TableCell>{result.accuracy}%</TableCell>
                  <TableCell>
                    <Badge variant={result.score >= 75 ? "default" : "secondary"}>
                      {result.score >= 75 ? "Pass" : "Average"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
