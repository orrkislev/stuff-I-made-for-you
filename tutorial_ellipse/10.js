//:HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">10. Finishing Touches I: Smooth Movement</h2>
<p class="mb-4">Let's add some smoothness to our cosmic dance! We'll use interpolation to create a more fluid movement of our ellipses. It's like our constellation is floating in zero gravity!</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">lookPos = lookPos.lerp(V(mouseX - width / 2, mouseY - height / 2), 0.3)</code>: This line creates smooth movement by interpolating between the current position and the mouse position.</li>
        <li><code class="bg-gray-200 px-1 rounded">rotate(lookPos.heading())</code>: We now rotate based on the interpolated position.</li>
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
    }
    pop()
}


drawTheCircle(100, 0)
drawTheCircle(150, 20)
drawTheCircle(50, 40)
drawTheCircle(80, 60)
drawTheCircle(30, 80)
drawTheCircle(120, 100)
drawTheCircle(70, 120)

