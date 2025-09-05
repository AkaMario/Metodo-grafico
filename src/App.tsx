"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import { GraphicalSolver } from "@/components/Graphical-solver"

interface Constraint {
  id: string
  a: number
  b: number
  value: number
  operator: "<=" | ">=" | "="
}

interface ObjectiveFunction {
  a: number
  b: number
}

export default function OperationsResearchCalculator() {
  const [objectiveFunction, setObjectiveFunction] = useState<ObjectiveFunction>({ a: 1, b: 1 })
  const [optimizationType, setOptimizationType] = useState<"maximize" | "minimize">("maximize")
  const [constraints, setConstraints] = useState<Constraint[]>([
    { id: "1", a: 1, b: 1, value: 10, operator: "<=" },
    { id: "2", a: 2, b: 1, value: 15, operator: "<=" },
  ])
  const [showSolution, setShowSolution] = useState(false)

  const addConstraint = () => {
    const newId = (constraints.length + 1).toString()
    setConstraints([...constraints, { id: newId, a: 1, b: 1, value: 10, operator: "<=" }])
  }

  const removeConstraint = (id: string) => {
    setConstraints(constraints.filter((c) => c.id !== id))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateConstraint = (id: string, field: keyof Constraint, value: any) => {
    setConstraints(constraints.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const solve = () => {
    setShowSolution(true)
  }

  const reset = () => {
    setShowSolution(false)
    setObjectiveFunction({ a: 1, b: 1 })
    setOptimizationType("maximize")
    setConstraints([
      { id: "1", a: 1, b: 1, value: 10, operator: "<=" },
      { id: "2", a: 2, b: 1, value: 15, operator: "<=" },
    ])
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-4 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Calculadora Método Gráfico</h1>
          <p className="text-lg text-gray-400">Investigación de Operaciones - Programación Lineal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de entrada */}
          <div className="space-y-6">
            {/* Función Objetivo */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-100">Función Objetivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={optimizationType}
                    onValueChange={(value: "maximize" | "minimize") => setOptimizationType(value)}
                  >
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-gray-100 border-gray-700">
                      <SelectItem value="maximize">Maximizar</SelectItem>
                      <SelectItem value="minimize">Minimizar</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-lg font-medium text-white">Z =</span>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={objectiveFunction.a}
                    onChange={(e) => setObjectiveFunction({ ...objectiveFunction, a: Number(e.target.value) })}
                    className="w-20 bg-gray-800 border-gray-600 text-gray-100"
                    step="0.1"
                  />
                  <span className="text-white">X₁ +</span>
                  <Input
                    type="number"
                    value={objectiveFunction.b}
                    onChange={(e) => setObjectiveFunction({ ...objectiveFunction, b: Number(e.target.value) })}
                    className="w-20 bg-gray-800 border-gray-600 text-gray-100"
                    step="0.1"
                  />
                  <span className="text-white">X₂</span>
                </div>
              </CardContent>
            </Card>

            {/* Restricciones */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-100">
                  <span className="flex items-center gap-2">Restricciones</span>
                  <Button onClick={addConstraint} size="sm" variant="outline" className="border-gray-800 bg-black text-gray-100">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {constraints.map((constraint, index) => (
                  <div key={constraint.id} className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                    <div
                      className={`w-4 h-4 rounded-full`}
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                    ></div>

                    <Input
                      type="number"
                      value={constraint.a}
                      onChange={(e) => updateConstraint(constraint.id, "a", Number(e.target.value))}
                      className="w-20 bg-gray-800 border-gray-600 text-gray-100"
                      step="0.1"
                    />
                    <span className="text-white">X₁ +</span>

                    <Input
                      type="number"
                      value={constraint.b}
                      onChange={(e) => updateConstraint(constraint.id, "b", Number(e.target.value))}
                      className="w-20 bg-gray-800 border-gray-600 text-gray-100"
                      step="0.1"
                    />
                    <span className="text-white">X₂</span>

                    <Select
                      value={constraint.operator}
                      onValueChange={(value: "<=" | ">=" | "=") => updateConstraint(constraint.id, "operator", value)}
                    >
                      <SelectTrigger className="w-16 bg-gray-800 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                        <SelectItem value="<=">≤</SelectItem>
                        <SelectItem value=">=">≥</SelectItem>
                        <SelectItem value="=">=</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      value={constraint.value}
                      onChange={(e) => updateConstraint(constraint.id, "value", Number(e.target.value))}
                      className="w-20 bg-gray-800 border-gray-600 text-gray-100"
                      step="0.1"
                    />

                    {constraints.length > 1 && (
                      <Button
                        onClick={() => removeConstraint(constraint.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-400 hover:text-red-500 border-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Restricciones de no negatividad */}
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-300 mb-2">Restricciones de no negatividad:</p>
                  <p className="text-sm text-gray-400">X₁ ≥ 0, X₂ ≥ 0</p>
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex gap-4">
              <Button onClick={solve} variant="outline" className="flex-1 border-gray-800 bg-black hover:bg-white hover:text-black text-gray-100" size="lg">
                Resolver
              </Button>
              <Button onClick={reset} variant="outline" size="lg" className=" border-gray-800 bg-black text-gray-100">
                Limpiar
              </Button>
            </div>
          </div>

          {/* Panel de gráfica y solución */}
          <div>
            {showSolution ? (
              <GraphicalSolver
                objectiveFunction={objectiveFunction}
                optimizationType={optimizationType}
                constraints={constraints}
              />
            ) : (
              <Card className="h-full flex items-center justify-center bg-gray-900 border-gray-700">
                <CardContent className="text-center">
                  <div className="text-6xl mb-4 text-gray-700">Gráfica</div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">Gráfica del Método Gráfico</h3>
                  <p className="text-gray-400">
                    Ingresa tu función objetivo y restricciones, luego presiona "Resolver" para ver la gráfica y la
                    solución óptima.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
