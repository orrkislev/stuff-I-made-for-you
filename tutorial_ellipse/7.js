//:HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">7. Adding a Glow Effect</h2>
<p class="mb-4">Let's make it shine! We're adding a white glow to our ellipses against a dark background. It's like neon signs floating in space. Watch how the glow changes as you move your mouse!</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">background(0)</code>: Sets a black background for contrast.</li>
        <li><code class="bg-gray-200 px-1 rounded">drawingContext.shadowColor = 'white'</code>: Sets the glow color.</li>
        <li><code class="bg-gray-200 px-1 rounded">drawingContext.shadowBlur = 10</code>: Adjusts the glow intensity.</li>
    </ul>
</div>
//:JS
background(0)
stroke(255, 255, 0)
noFill()

const dirVector = V(mouseX - width / 2, mouseY - height / 2)
const ang = dirVector.heading()
rotate(ang)

ratio = map(dirVector.mag(), 0, width / 2, 1, .2)
size = 100

drawingContext.shadowColor = 'white'
drawingContext.shadowBlur = 10
ellipse(0, 0, size * ratio, size)

zOffset = 50
translate(zOffset * (1 - ratio), 0)
size = 80
ellipse(0, 0, size * ratio, size)
