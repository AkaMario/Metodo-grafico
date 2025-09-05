"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "./ui/badge"

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

interface Point {
  x: number
  y: number
}

interface GraphicalSolverProps {
  objectiveFunction: ObjectiveFunction
  optimizationType: "maximize" | "minimize"
  constraints: Constraint[]
}

export function GraphicalSolver({ objectiveFunction, optimizationType, constraints }: GraphicalSolverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [solution, setSolution] = useState<{
    point: Point
    value: number
    vertices: Point[]
  } | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      drawGraph()
      calculateSolution()
    }
  }, [objectiveFunction, optimizationType, constraints])

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas
    canvas.width = 600
    canvas.height = 500
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurar sistema de coordenadas
    const padding = 60
    const graphWidth = canvas.width - 2 * padding
    const graphHeight = canvas.height - 2 * padding

    // Encontrar el rango apropiado
    const maxValue = Math.max(
      ...constraints.map((c) => Math.max(c.value / Math.max(c.a, 0.1), c.value / Math.max(c.b, 0.1))),
      20,
    )
    const scale = Math.min(graphWidth, graphHeight) / (maxValue * 1.2)

    // Función para convertir coordenadas del problema a coordenadas del canvas
    const toCanvas = (x: number, y: number) => ({
      x: padding + x * scale,
      y: canvas.height - padding - y * scale,
    })

    // Dibujar ejes
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2
    ctx.beginPath()
    // Eje X
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    // Eje Y
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(padding, padding)
    ctx.stroke()

    // Etiquetas de los ejes
    ctx.fillStyle = "#374151"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("X₁", canvas.width - 30, canvas.height - padding + 20)
    ctx.save()
    ctx.translate(30, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("X₂", 0, 0)
    ctx.restore()

    // Dibujar marcas en los ejes
    ctx.fillStyle = "#6B7280"
    ctx.font = "12px sans-serif"
    for (let i = 0; i <= maxValue; i += Math.ceil(maxValue / 10)) {
      const canvasPoint = toCanvas(i, 0)
      ctx.fillText(i.toString(), canvasPoint.x, canvas.height - padding + 15)

      const canvasPointY = toCanvas(0, i)
      ctx.textAlign = "right"
      ctx.fillText(i.toString(), padding - 5, canvasPointY.y + 4)
    }
    ctx.textAlign = "center"

    // Dibujar restricciones
    const colors = ["#EF4444", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"]

    constraints.forEach((constraint, index) => {
      const color = colors[index % colors.length]

      // Calcular puntos de intersección con los ejes
      const points: Point[] = []

      // Intersección con eje X (y = 0)
      if (constraint.b !== 0) {
        const x = constraint.value / constraint.a
        if (x >= 0) points.push({ x, y: 0 })
      }

      // Intersección con eje Y (x = 0)
      if (constraint.a !== 0) {
        const y = constraint.value / constraint.b
        if (y >= 0) points.push({ x: 0, y })
      }

      // Dibujar línea de la restricción
      if (points.length >= 2) {
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        const start = toCanvas(points[0].x, points[0].y)
        const end = toCanvas(points[1].x, points[1].y)
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()

        // Etiqueta de la restricción
        const midX = (start.x + end.x) / 2
        const midY = (start.y + end.y) / 2
        ctx.fillStyle = color
        ctx.font = "bold 12px sans-serif"
        ctx.fillText(
          `${constraint.a}x₁ + ${constraint.b}x₂ ${constraint.operator} ${constraint.value}`,
          midX,
          midY - 10,
        )
      }

      // Sombrear región factible
      if (constraint.operator === "<=") {
        ctx.fillStyle = color + "20"
        ctx.beginPath()
        ctx.moveTo(padding, canvas.height - padding)
        if (points.length >= 2) {
          const start = toCanvas(points[0].x, points[0].y)
          const end = toCanvas(points[1].x, points[1].y)
          ctx.lineTo(start.x, start.y)
          ctx.lineTo(end.x, end.y)
        }
        ctx.lineTo(padding, padding)
        ctx.closePath()
        ctx.fill()
      }
    })

    // Dibujar región factible (intersección de todas las restricciones)
    const feasibleRegion = calculateFeasibleRegion()
    if (feasibleRegion.length > 0) {
      ctx.fillStyle = "rgba(34, 197, 94, 0.1)"
      ctx.strokeStyle = "#22C55E"
      ctx.lineWidth = 3
      ctx.beginPath()
      const firstPoint = toCanvas(feasibleRegion[0].x, feasibleRegion[0].y)
      ctx.moveTo(firstPoint.x, firstPoint.y)

      for (let i = 1; i < feasibleRegion.length; i++) {
        const point = toCanvas(feasibleRegion[i].x, feasibleRegion[i].y)
        ctx.lineTo(point.x, point.y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Marcar vértices
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      feasibleRegion.forEach((vertex, index) => {
        const canvasPoint = toCanvas(vertex.x, vertex.y)
        ctx.fillStyle = "#1F2937"
        ctx.beginPath()
        ctx.arc(canvasPoint.x, canvasPoint.y, 5, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = "#1F2937"
        ctx.font = "12px sans-serif"
        ctx.fillText(`(${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)})`, canvasPoint.x + 10, canvasPoint.y - 10)
      })
    }
  }

  const calculateFeasibleRegion = (): Point[] => {
    // Calcular vértices de la región factible
    const vertices: Point[] = []

    // Agregar origen si es factible
    if (isPointFeasible({ x: 0, y: 0 })) {
      vertices.push({ x: 0, y: 0 })
    }

    // Intersecciones con los ejes
    constraints.forEach((constraint) => {
      // Intersección con eje X
      if (constraint.a !== 0) {
        const x = constraint.value / constraint.a
        const point = { x, y: 0 }
        if (x >= 0 && isPointFeasible(point)) {
          vertices.push(point)
        }
      }

      // Intersección con eje Y
      if (constraint.b !== 0) {
        const y = constraint.value / constraint.b
        const point = { x: 0, y }
        if (y >= 0 && isPointFeasible(point)) {
          vertices.push(point)
        }
      }
    })

    // Intersecciones entre restricciones
    for (let i = 0; i < constraints.length; i++) {
      for (let j = i + 1; j < constraints.length; j++) {
        const intersection = findIntersection(constraints[i], constraints[j])
        if (intersection && intersection.x >= 0 && intersection.y >= 0 && isPointFeasible(intersection)) {
          vertices.push(intersection)
        }
      }
    }

    // Eliminar duplicados y ordenar
    const uniqueVertices = vertices.filter(
      (vertex, index, self) =>
        index === self.findIndex((v) => Math.abs(v.x - vertex.x) < 0.001 && Math.abs(v.y - vertex.y) < 0.001),
    )

    // Ordenar vértices en sentido horario
    const center = uniqueVertices.reduce((acc, vertex) => ({ x: acc.x + vertex.x, y: acc.y + vertex.y }), {
      x: 0,
      y: 0,
    })
    center.x /= uniqueVertices.length
    center.y /= uniqueVertices.length

    return uniqueVertices.sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x)
      const angleB = Math.atan2(b.y - center.y, b.x - center.x)
      return angleA - angleB
    })
  }

  const isPointFeasible = (point: Point): boolean => {
    return constraints.every((constraint) => {
      const value = constraint.a * point.x + constraint.b * point.y
      switch (constraint.operator) {
        case "<=":
          return value <= constraint.value + 0.001
        case ">=":
          return value >= constraint.value - 0.001
        case "=":
          return Math.abs(value - constraint.value) < 0.001
        default:
          return false
      }
    })
  }

  const findIntersection = (c1: Constraint, c2: Constraint): Point | null => {
    const det = c1.a * c2.b - c2.a * c1.b
    if (Math.abs(det) < 0.001) return null // Líneas paralelas

    const x = (c1.value * c2.b - c2.value * c1.b) / det
    const y = (c1.a * c2.value - c2.a * c1.value) / det

    return { x, y }
  }

  const calculateSolution = () => {
    const vertices = calculateFeasibleRegion()
    if (vertices.length === 0) {
      setSolution(null)
      return
    }

    let optimalPoint = vertices[0]
    let optimalValue = objectiveFunction.a * optimalPoint.x + objectiveFunction.b * optimalPoint.y

    vertices.forEach((vertex) => {
      const value = objectiveFunction.a * vertex.x + objectiveFunction.b * vertex.y
      if (
        (optimizationType === "maximize" && value > optimalValue) ||
        (optimizationType === "minimize" && value < optimalValue)
      ) {
        optimalPoint = vertex
        optimalValue = value
      }
    })

    setSolution({
      point: optimalPoint,
      value: optimalValue,
      vertices,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle> Gráfica del Método Gráfico</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded-lg w-full"
            style={{ maxWidth: "600px", height: "auto" }}
          />
        </CardContent>
      </Card>

      {solution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🎯 Solución Óptima</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Punto Óptimo</h4>
                <p className="text-lg">
                  X₁ = <span className="font-bold">{solution.point.x.toFixed(2)}</span>
                </p>
                <p className="text-lg">
                  X₂ = <span className="font-bold">{solution.point.y.toFixed(2)}</span>
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Valor Óptimo</h4>
                <p className="text-2xl font-bold text-blue-900">Z = {solution.value.toFixed(2)}</p>
                <Badge variant={optimizationType === "maximize" ? "default" : "secondary"}>
                  {optimizationType === "maximize" ? "Maximizado" : "Minimizado"}
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Vértices de la Región Factible</h4>
              <div className="flex flex-wrap gap-2">
                {solution.vertices.map((vertex, index) => (
                  <Badge key={index} variant="outline">
                    ({vertex.x.toFixed(2)}, {vertex.y.toFixed(2)})
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Interpretación</h4>
              <p className="text-sm text-yellow-700">
                La solución óptima se encuentra en el punto ({solution.point.x.toFixed(2)},{" "}
                {solution.point.y.toFixed(2)}) donde la función objetivo Z = {objectiveFunction.a}X₁ +{" "}
                {objectiveFunction.b}X₂ alcanza su valor {optimizationType === "maximize" ? "máximo" : "mínimo"}
                de {solution.value.toFixed(2)}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
