//:HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">11. Finishing Touches II: FX</h2>
<p class="mb-4">
    Time to make our ellipses pop! We've added a soft fill glow, and small arcs act as highlight, like a lens flare in space.
</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">arc(0, 0, size * ratio, size, lookPos.heading() + 180, lookPos.heading() + 180 + size / 20)</code>: This adds arcs to our ellipses, creating a 3D-like effect.</li>
        <li><code class="bg-gray-200 px-1 rounded">drawingContext.filter = 'blur(10px)'</code>: Applies a blur effect to enhance the glow.</li>
        <li><code class="bg-gray-200 px-1 rounded">fill(255, 255, 0, 20)</code>: Adds a subtle yellow fill to each ellipse.</li>
    </ul>
</div>
//:JS
background(0)
stroke(255, 255, 0)
noFill()

lookPos = lookPos.lerp(V(mouseX - width / 2, mouseY - height / 2), 0.3)
rotate(lookPos.heading())
ratio = map(lookPos.mag(), 0, width / 2, 1, .2)

drawingContext.shadowColor = 'white'
const blurs = [80, 40, 20, 10, 10, 10]

function drawTheCircle(size, zOffset) {
    push()
    translate(zOffset * (1 - ratio), 0)
    for (const blur of blurs) {
        drawingContext.shadowBlur = blur
        ellipse(0, 0, size * ratio, size)
        arc(0, 0, size * ratio, size, lookPos.heading() + 180, lookPos.heading() + 180 + size / 20)
        arc(0, 0, size * ratio, size, lookPos.heading() + 180, lookPos.heading() + 180 + size / 20)
    }
    drawingContext.shadowBlur = 0
    drawingContext.filter = 'blur(10px)'
    fill(255, 255, 0, 20)
    noStroke()
    ellipse(0, 0, size * ratio, size)
    pop()
}


drawTheCircle(100, 0)
drawTheCircle(150, 20)
drawTheCircle(50, 40)
drawTheCircle(80, 60)
drawTheCircle(30, 80)
drawTheCircle(120, 100)
drawTheCircle(70, 120)

